import { createClient } from "@/lib/supabase/server";
import { shiftDateStr, todayInAppTz } from "@/lib/date";
import { evaluateNewBadges, type BadgeContext } from "@/lib/gamification";
import { estimateCycle, type CycleEstimate } from "@/lib/cycle";
import { fetchCurrentWeather, type CurrentWeather } from "@/lib/weather";
import type { FoodLog, GamificationState, PetCareLog, Profile, SymptomLog } from "@/lib/database.types";

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
}

export interface TodaySummary {
  foodLogs: FoodLog[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSodium: number;
  totalCalcium: number;
  waterMl: number;
  sleepHours: number | null;
  sleepBedtime: string | null;
  weightKg: number | null;
}

export async function getTodaySummary(): Promise<TodaySummary> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = todayInAppTz();

  const empty: TodaySummary = {
    foodLogs: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalFiber: 0,
    totalSodium: 0,
    totalCalcium: 0,
    waterMl: 0,
    sleepHours: null,
    sleepBedtime: null,
    weightKg: null,
  };
  if (!user) return empty;

  const [{ data: foodLogs }, { data: waterLogs }, { data: sleepLog }, { data: weightLog }] = await Promise.all([
    supabase.from("food_logs").select("*").eq("user_id", user.id).eq("log_date", today).order("logged_at"),
    supabase.from("water_logs").select("amount_ml").eq("user_id", user.id).eq("log_date", today),
    supabase.from("sleep_logs").select("hours, bedtime").eq("user_id", user.id).eq("log_date", today).maybeSingle(),
    supabase.from("weight_logs").select("weight_kg").eq("user_id", user.id).eq("log_date", today).maybeSingle(),
  ]);

  const logs = foodLogs ?? [];
  const totals = logs.reduce(
    (acc, l) => {
      acc.totalCalories += l.calories;
      acc.totalProtein += l.protein_g;
      acc.totalCarbs += l.carbs_g;
      acc.totalFat += l.fat_g;
      acc.totalFiber += l.fiber_g;
      acc.totalSodium += l.sodium_mg;
      acc.totalCalcium += l.calcium_mg;
      return acc;
    },
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, totalFiber: 0, totalSodium: 0, totalCalcium: 0 },
  );

  const waterMl = (waterLogs ?? []).reduce((sum, w) => sum + w.amount_ml, 0);

  return {
    foodLogs: logs,
    ...totals,
    waterMl,
    sleepHours: sleepLog?.hours ?? null,
    sleepBedtime: sleepLog?.bedtime ?? null,
    weightKg: weightLog?.weight_kg ?? null,
  };
}

export interface GamificationSummary {
  state: GamificationState;
  newlyEarned: string[];
}

export async function getGamificationSummary(): Promise<GamificationSummary | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: state } = await supabase
    .from("gamification_state")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (!state) return null;

  const since = shiftDateStr(todayInAppTz(), -60);

  const [{ count: totalFoodLogs }, { count: totalWorkouts }, { data: waterRows }, { count: totalSleepLogs }] =
    await Promise.all([
      supabase.from("food_logs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("workout_logs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("water_logs").select("log_date, amount_ml").eq("user_id", user.id).gte("log_date", since),
      supabase.from("sleep_logs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);

  const { data: profile } = await supabase
    .from("profiles")
    .select("water_target_ml")
    .eq("id", user.id)
    .single();
  const waterTarget = profile?.water_target_ml ?? 2000;

  const byDay = new Map<string, number>();
  for (const row of waterRows ?? []) {
    byDay.set(row.log_date, (byDay.get(row.log_date) ?? 0) + row.amount_ml);
  }
  const totalWaterGoalDays = [...byDay.values()].filter((ml) => ml >= waterTarget).length;

  const { data: foodDates } = await supabase
    .from("food_logs")
    .select("log_date")
    .eq("user_id", user.id)
    .gte("log_date", since);
  const { data: sleepDates } = await supabase
    .from("sleep_logs")
    .select("log_date")
    .eq("user_id", user.id)
    .gte("log_date", since);

  const foodDaySet = new Set((foodDates ?? []).map((r) => r.log_date));
  const sleepDaySet = new Set((sleepDates ?? []).map((r) => r.log_date));
  const waterDaySet = new Set(byDay.keys());
  let daysWithFullLog = 0;
  for (const d of foodDaySet) {
    if (sleepDaySet.has(d) && waterDaySet.has(d)) daysWithFullLog++;
  }

  const ctx: BadgeContext = {
    state,
    totalFoodLogs: totalFoodLogs ?? 0,
    totalWorkouts: totalWorkouts ?? 0,
    totalWaterGoalDays,
    totalSleepLogs: totalSleepLogs ?? 0,
    daysWithFullLog,
  };

  const newlyEarned = evaluateNewBadges(ctx);
  if (newlyEarned.length > 0) {
    const updatedBadges = [...state.badges, ...newlyEarned];
    await supabase.from("gamification_state").update({ badges: updatedBadges }).eq("user_id", user.id);
    state.badges = updatedBadges;
  }

  return { state, newlyEarned };
}

export interface CycleSummary {
  estimate: CycleEstimate | null;
  lastPeriodStart: string | null;
  onBirthControl: boolean;
  avgCycleLength: number;
  pillTakenToday: boolean;
}

export async function getCycleSummary(): Promise<CycleSummary | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = todayInAppTz();

  const [{ data: profile }, { data: lastPeriod }, { data: pillLog }] = await Promise.all([
    supabase.from("profiles").select("avg_cycle_length, on_birth_control").eq("id", user.id).single(),
    supabase
      .from("cycle_logs")
      .select("period_start_date")
      .eq("user_id", user.id)
      .order("period_start_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("pill_logs").select("taken").eq("user_id", user.id).eq("log_date", today).maybeSingle(),
  ]);

  const avgCycleLength = profile?.avg_cycle_length ?? 28;
  const lastPeriodStart = lastPeriod?.period_start_date ?? null;

  return {
    estimate: estimateCycle(lastPeriodStart, avgCycleLength),
    lastPeriodStart,
    onBirthControl: profile?.on_birth_control ?? false,
    avgCycleLength,
    pillTakenToday: pillLog?.taken ?? false,
  };
}

export async function getCurrentWeatherForUser(): Promise<{ weather: CurrentWeather | null; city: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { weather: null, city: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("city, latitude, longitude")
    .eq("id", user.id)
    .single();

  if (profile?.latitude == null || profile?.longitude == null) {
    return { weather: null, city: profile?.city ?? null };
  }

  const weather = await fetchCurrentWeather(profile.latitude, profile.longitude);
  return { weather, city: profile.city };
}

export async function getTodayPetCare(): Promise<PetCareLog | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = todayInAppTz();
  const { data } = await supabase
    .from("pet_care_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("log_date", today)
    .maybeSingle();

  return data ?? null;
}

export async function getRecentSymptomLogs(days = 14): Promise<SymptomLog[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const since = shiftDateStr(todayInAppTz(), -(days - 1));
  const { data } = await supabase
    .from("symptom_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("log_date", since)
    .order("log_date", { ascending: false });

  return data ?? [];
}

export interface HistoryPoint {
  date: string;
  weightKg: number | null;
  waterMl: number;
  sleepHours: number | null;
  calories: number;
}

export async function getHistory(days = 14): Promise<HistoryPoint[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const today = todayInAppTz();
  const since = shiftDateStr(today, -(days - 1));

  const [{ data: weights }, { data: water }, { data: sleep }, { data: food }] = await Promise.all([
    supabase.from("weight_logs").select("log_date, weight_kg").eq("user_id", user.id).gte("log_date", since),
    supabase.from("water_logs").select("log_date, amount_ml").eq("user_id", user.id).gte("log_date", since),
    supabase.from("sleep_logs").select("log_date, hours").eq("user_id", user.id).gte("log_date", since),
    supabase.from("food_logs").select("log_date, calories").eq("user_id", user.id).gte("log_date", since),
  ]);

  const points: HistoryPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = shiftDateStr(today, -i);
    const weight = weights?.find((w) => w.log_date === date)?.weight_kg ?? null;
    const waterMl = (water ?? []).filter((w) => w.log_date === date).reduce((s, w) => s + w.amount_ml, 0);
    const sleepHours = sleep?.find((s) => s.log_date === date)?.hours ?? null;
    const calories = (food ?? []).filter((f) => f.log_date === date).reduce((s, f) => s + f.calories, 0);
    points.push({ date, weightKg: weight, waterMl, sleepHours, calories });
  }
  return points;
}
