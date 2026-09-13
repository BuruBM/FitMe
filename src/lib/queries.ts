import { createClient } from "@/lib/supabase/server";
import { shiftDateStr, todayInAppTz } from "@/lib/date";
import { evaluateNewBadges, type BadgeContext } from "@/lib/gamification";
import { estimateCycle, type CycleEstimate } from "@/lib/cycle";
import { fetchCurrentWeather, type CurrentWeather } from "@/lib/weather";
import { computeInsights, type Insight } from "@/lib/insights";
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
  sleepWakeUps: number | null;
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
    sleepWakeUps: null,
    weightKg: null,
  };
  if (!user) return empty;

  const [{ data: foodLogs }, { data: waterLogs }, { data: sleepLog }, { data: weightLog }] = await Promise.all([
    supabase.from("food_logs").select("*").eq("user_id", user.id).eq("log_date", today).order("logged_at"),
    supabase.from("water_logs").select("amount_ml").eq("user_id", user.id).eq("log_date", today),
    supabase.from("sleep_logs").select("hours, bedtime, wake_ups").eq("user_id", user.id).eq("log_date", today).maybeSingle(),
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
    sleepWakeUps: sleepLog?.wake_ups ?? null,
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

export async function getDashboardInsights(): Promise<Insight[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const today = todayInAppTz();
  const since14 = shiftDateStr(today, -13);
  const since3 = shiftDateStr(today, -2);

  const [{ data: profile }, { data: symptomLogs }, { data: foodLogs }, { data: sleepLogs }, cycleSummary] =
    await Promise.all([
      supabase.from("profiles").select("protein_target_g, pcos").eq("id", user.id).single(),
      supabase
        .from("symptom_logs")
        .select("log_date, mood, irritability, social_media_minutes, social_contact, cloud_cover_pct")
        .eq("user_id", user.id)
        .gte("log_date", since14)
        .order("log_date", { ascending: false }),
      supabase.from("food_logs").select("log_date, protein_g").eq("user_id", user.id).gte("log_date", since3),
      supabase.from("sleep_logs").select("hours").eq("user_id", user.id).gte("log_date", since3),
      getCycleSummary(),
    ]);

  const logs = symptomLogs ?? [];
  const last3 = logs.filter((l) => l.log_date >= since3);
  const avg = (nums: number[]) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null);

  const avgIrritability3d = avg(last3.map((l) => l.irritability).filter((v): v is number => v != null));
  const avgSocialMediaMin3d = avg(last3.map((l) => l.social_media_minutes).filter((v): v is number => v != null));
  const avgMood3d = avg(last3.map((l) => l.mood).filter((v): v is number => v != null));
  const avgSleepHours3d = avg((sleepLogs ?? []).map((s) => s.hours));

  const proteinTarget = profile?.protein_target_g ?? null;
  let avgProteinPct3d: number | null = null;
  if (proteinTarget) {
    const byDay = new Map<string, number>();
    for (const row of foodLogs ?? []) {
      byDay.set(row.log_date, (byDay.get(row.log_date) ?? 0) + row.protein_g);
    }
    const pcts = [...byDay.values()].map((g) => (g / proteinTarget) * 100);
    avgProteinPct3d = avg(pcts);
  }

  const todayLog = logs.find((l) => l.log_date === today);
  const lastContactLog = logs.find((l) => l.social_contact != null && l.social_contact > 0);
  const daysSinceSocialContact = lastContactLog
    ? Math.round((new Date(today).getTime() - new Date(lastContactLog.log_date).getTime()) / 86400000)
    : logs.length > 0
      ? 14
      : null;

  return computeInsights({
    phase: cycleSummary?.estimate?.phase ?? null,
    pcos: profile?.pcos ?? false,
    avgProteinPct3d,
    avgSleepHours3d,
    avgIrritability3d,
    avgSocialMediaMin3d,
    avgMood3d,
    daysSinceSocialContact,
    todayCloudCoverPct: todayLog?.cloud_cover_pct ?? null,
    todayMood: todayLog?.mood ?? null,
  });
}

export interface HistoryPoint {
  date: string;
  weightKg: number | null;
  waterMl: number;
  sleepHours: number | null;
  calories: number;
  proteinG: number;
  mood: number | null;
  energy: number | null;
  irritability: number | null;
  movementLevel: number | null;
  petCareDone: boolean | null;
  /** 0-100 composite of whatever metrics were logged that day; null if too little data. */
  wellness: number | null;
}

function pct(value: number, target: number): number {
  return target > 0 ? Math.min(100, Math.max(0, (value / target) * 100)) : 0;
}

function scale1to5(value: number): number {
  return ((value - 1) / 4) * 100;
}

export async function getHistory(days = 14): Promise<HistoryPoint[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const today = todayInAppTz();
  const since = shiftDateStr(today, -(days - 1));

  const [{ data: profile }, { data: weights }, { data: water }, { data: sleep }, { data: food }, { data: symptoms }, { data: petCare }] =
    await Promise.all([
      supabase.from("profiles").select("sleep_target_hours, water_target_ml, protein_target_g").eq("id", user.id).single(),
      supabase.from("weight_logs").select("log_date, weight_kg").eq("user_id", user.id).gte("log_date", since),
      supabase.from("water_logs").select("log_date, amount_ml").eq("user_id", user.id).gte("log_date", since),
      supabase.from("sleep_logs").select("log_date, hours").eq("user_id", user.id).gte("log_date", since),
      supabase.from("food_logs").select("log_date, calories, protein_g").eq("user_id", user.id).gte("log_date", since),
      supabase
        .from("symptom_logs")
        .select("log_date, mood, energy, irritability, movement_level")
        .eq("user_id", user.id)
        .gte("log_date", since),
      supabase
        .from("pet_care_logs")
        .select("log_date, milo_medication, milo_supplement, zoe_medication, zoe_supplement")
        .eq("user_id", user.id)
        .gte("log_date", since),
    ]);

  const weightByDay = new Map((weights ?? []).map((w) => [w.log_date, w.weight_kg]));
  const sleepByDay = new Map((sleep ?? []).map((s) => [s.log_date, s.hours]));
  const symptomByDay = new Map((symptoms ?? []).map((s) => [s.log_date, s]));
  const petCareByDay = new Map((petCare ?? []).map((p) => [p.log_date, p]));

  const waterByDay = new Map<string, number>();
  for (const w of water ?? []) waterByDay.set(w.log_date, (waterByDay.get(w.log_date) ?? 0) + w.amount_ml);

  const caloriesByDay = new Map<string, number>();
  const proteinByDay = new Map<string, number>();
  for (const f of food ?? []) {
    caloriesByDay.set(f.log_date, (caloriesByDay.get(f.log_date) ?? 0) + f.calories);
    proteinByDay.set(f.log_date, (proteinByDay.get(f.log_date) ?? 0) + f.protein_g);
  }

  const sleepTarget = profile?.sleep_target_hours ?? 7.5;
  const waterTarget = profile?.water_target_ml ?? 2000;
  const proteinTarget = profile?.protein_target_g ?? 90;

  const points: HistoryPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = shiftDateStr(today, -i);
    const symptom = symptomByDay.get(date);
    const waterMl = waterByDay.get(date) ?? 0;
    const sleepHours = sleepByDay.get(date) ?? null;
    const proteinG = proteinByDay.get(date) ?? 0;
    const pet = petCareByDay.get(date);
    const petCareDone = pet ? pet.milo_medication && pet.milo_supplement && pet.zoe_medication && pet.zoe_supplement : null;

    const wellnessInputs: number[] = [];
    if (symptom?.mood != null) wellnessInputs.push(scale1to5(symptom.mood));
    if (symptom?.energy != null) wellnessInputs.push(scale1to5(symptom.energy));
    if (symptom?.irritability != null) wellnessInputs.push(100 - scale1to5(symptom.irritability));
    if (symptom?.movement_level != null) wellnessInputs.push(scale1to5(symptom.movement_level));
    if (sleepHours != null) wellnessInputs.push(pct(sleepHours, sleepTarget));
    if (waterMl > 0) wellnessInputs.push(pct(waterMl, waterTarget));
    if (proteinG > 0) wellnessInputs.push(pct(proteinG, proteinTarget));

    const wellness =
      wellnessInputs.length >= 2
        ? Math.round(wellnessInputs.reduce((a, b) => a + b, 0) / wellnessInputs.length)
        : null;

    points.push({
      date,
      weightKg: weightByDay.get(date) ?? null,
      waterMl,
      sleepHours,
      calories: caloriesByDay.get(date) ?? 0,
      proteinG,
      mood: symptom?.mood ?? null,
      energy: symptom?.energy ?? null,
      irritability: symptom?.irritability ?? null,
      movementLevel: symptom?.movement_level ?? null,
      petCareDone,
      wellness,
    });
  }
  return points;
}
