import { cache } from "react";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { shiftDateStr, todayInAppTz } from "@/lib/date";
import { evaluateNewBadges, type BadgeContext } from "@/lib/gamification";
import {
  daysUntilNextPeriod,
  estimateCycle,
  estimateCycleForDate,
  type CycleEstimate,
  type CyclePhase,
} from "@/lib/cycle";
import { fetchCurrentWeather, type CurrentWeather } from "@/lib/weather";
import { computeInsights, type Insight } from "@/lib/insights";
import { buildWeeklyReview, type WeeklyReview } from "@/lib/weeklyReview";
import type {
  BodyMeasurement,
  FoodLog,
  GamificationState,
  PetCareLog,
  Profile,
  SleepLog,
  SymptomLog,
  WorkoutLog,
} from "@/lib/database.types";

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();
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
  const user = await getCurrentUser();
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
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: state } = await supabase
    .from("gamification_state")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (!state) return null;

  const since = shiftDateStr(todayInAppTz(), -60);

  const [{ count: totalFoodLogs }, { count: totalWorkouts }, { data: waterRows }, { count: totalSleepLogs }, { data: petCareRows }] =
    await Promise.all([
      supabase.from("food_logs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("workout_logs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("water_logs").select("log_date, amount_ml").eq("user_id", user.id).gte("log_date", since),
      supabase.from("sleep_logs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase
        .from("pet_care_logs")
        .select("milo_medication, milo_supplement, zoe_medication, zoe_supplement")
        .eq("user_id", user.id),
    ]);

  const totalPetCareDaysComplete = (petCareRows ?? []).filter(
    (p) => p.milo_medication && p.milo_supplement && p.zoe_medication && p.zoe_supplement,
  ).length;

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
    totalPetCareDaysComplete,
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
  daysUntilNextPeriod: number | null;
  daysSincePillStart: number | null;
}

// Called both directly by the dashboard and internally by
// getDashboardInsights() — cache() dedupes those into a single DB round
// trip per request instead of running the same three queries twice.
export const getCycleSummary = cache(async (): Promise<CycleSummary | null> => {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const today = todayInAppTz();

  const [{ data: profile }, { data: lastPeriod }, { data: pillLog }] = await Promise.all([
    supabase.from("profiles").select("avg_cycle_length, on_birth_control, pill_started_on").eq("id", user.id).single(),
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
  const daysSincePillStart = profile?.pill_started_on
    ? Math.round((new Date(today).getTime() - new Date(profile.pill_started_on).getTime()) / 86400000)
    : null;

  return {
    estimate: estimateCycle(lastPeriodStart, avgCycleLength),
    lastPeriodStart,
    onBirthControl: profile?.on_birth_control ?? false,
    avgCycleLength,
    pillTakenToday: pillLog?.taken ?? false,
    daysUntilNextPeriod: daysUntilNextPeriod(lastPeriodStart, avgCycleLength),
    daysSincePillStart,
  };
});

// Every period start she's logged is kept (logPeriodStart upserts by date,
// it never overwrites a different date) — this surfaces that history so
// logging this month's start doesn't read as silently replacing the
// original one.
export async function getPeriodHistory(limit = 12): Promise<string[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return [];

  const { data } = await supabase
    .from("cycle_logs")
    .select("period_start_date")
    .eq("user_id", user.id)
    .order("period_start_date", { ascending: false })
    .limit(limit);

  return (data ?? []).map((r) => r.period_start_date);
}

export async function getCurrentWeatherForUser(): Promise<{ weather: CurrentWeather | null; city: string | null }> {
  const supabase = await createClient();
  const user = await getCurrentUser();
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
  const user = await getCurrentUser();
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

export async function getTodaySymptomLog(): Promise<SymptomLog | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const today = todayInAppTz();
  const { data } = await supabase
    .from("symptom_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("log_date", today)
    .maybeSingle();

  return data ?? null;
}

export async function getHiddenDefaultFoodIds(): Promise<string[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return [];

  const { data } = await supabase.from("hidden_default_foods").select("food_id").eq("user_id", user.id);
  return (data ?? []).map((r) => r.food_id);
}

export async function getYesterdayFoodLogs(): Promise<FoodLog[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return [];

  const yesterday = shiftDateStr(todayInAppTz(), -1);
  const { data } = await supabase
    .from("food_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("log_date", yesterday)
    .order("logged_at", { ascending: true });

  return data ?? [];
}

export async function getRecentFoodLogs(days = 14): Promise<FoodLog[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return [];

  const today = todayInAppTz();
  const since = shiftDateStr(today, -(days - 1));
  const { data } = await supabase
    .from("food_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("log_date", since)
    .lt("log_date", today)
    .order("log_date", { ascending: false })
    .order("logged_at", { ascending: true });

  return data ?? [];
}

export async function getRecentSleepLogs(days = 14): Promise<SleepLog[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return [];

  const since = shiftDateStr(todayInAppTz(), -(days - 1));
  const { data } = await supabase
    .from("sleep_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("log_date", since)
    .order("log_date", { ascending: false });

  return data ?? [];
}

export interface MeasurementTrend {
  latest: BodyMeasurement | null;
  previous: BodyMeasurement | null;
}

export async function getMeasurementTrend(): Promise<MeasurementTrend> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { latest: null, previous: null };

  const { data } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })
    .limit(2);

  return { latest: data?.[0] ?? null, previous: data?.[1] ?? null };
}

export async function getRecentWorkoutLogs(days = 21): Promise<WorkoutLog[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return [];

  const since = shiftDateStr(todayInAppTz(), -(days - 1));
  const { data } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("log_date", since)
    .order("completed_at", { ascending: false });

  return data ?? [];
}

export async function getDashboardInsights(): Promise<Insight[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return [];

  const today = todayInAppTz();
  const since14 = shiftDateStr(today, -13);
  const since3 = shiftDateStr(today, -2);

  const [{ data: profile }, { data: symptomLogs }, { data: foodLogs }, { data: sleepLogs }, cycleSummary] =
    await Promise.all([
      supabase.from("profiles").select("protein_target_g, pcos, pill_started_on, tracks_cycle").eq("id", user.id).single(),
      supabase
        .from("symptom_logs")
        .select("log_date, mood, irritability, sensitivity_level, social_media_minutes, social_contact, cloud_cover_pct")
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
  const avgSensitivity3d = avg(last3.map((l) => l.sensitivity_level).filter((v): v is number => v != null));
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

  const weekday = new Date(today + "T00:00:00").getDay();
  const isWeekend = weekday === 0 || weekday === 6;

  const daysSincePillStart = profile?.pill_started_on
    ? Math.round((new Date(today).getTime() - new Date(profile.pill_started_on).getTime()) / 86400000)
    : null;

  const tracksCycle = profile?.tracks_cycle ?? false;

  return computeInsights({
    phase: tracksCycle ? (cycleSummary?.estimate?.phase ?? null) : null,
    onBirthControl: tracksCycle && (cycleSummary?.onBirthControl ?? false),
    daysSincePillStart,
    pcos: profile?.pcos ?? false,
    isWeekend,
    avgProteinPct3d,
    avgSleepHours3d,
    avgIrritability3d,
    avgSensitivity3d,
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
  sleepQuality: number | null;
  sleepBedtime: string | null;
  sleepWakeUps: number | null;
  calories: number;
  proteinG: number;
  mood: number | null;
  energy: number | null;
  irritability: number | null;
  sensitivityLevel: number | null;
  stressLevel: number | null;
  bloating: number | null;
  alcoholUnits: number | null;
  tobaccoUsed: boolean | null;
  socialMediaMinutes: number | null;
  socialContact: number | null;
  cloudCoverPct: number | null;
  weatherCondition: string | null;
  notes: string | null;
  notesValence: number | null;
  cyclePhase: CyclePhase | null;
  movedToday: boolean;
  workoutNames: string[];
  petCareDone: boolean | null;
  pillTaken: boolean | null;
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
  const user = await getCurrentUser();
  if (!user) return [];

  const today = todayInAppTz();
  const since = shiftDateStr(today, -(days - 1));

  const [
    { data: profile },
    { data: weights },
    { data: water },
    { data: sleep },
    { data: food },
    { data: symptoms },
    { data: petCare },
    { data: workouts },
    { data: periodLogs },
    { data: pillLogs },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "sleep_target_hours, water_target_ml, protein_target_g, avg_cycle_length, on_birth_control, tracks_cycle, vacation_since, vacation_until",
      )
      .eq("id", user.id)
      .single(),
    supabase.from("weight_logs").select("log_date, weight_kg").eq("user_id", user.id).gte("log_date", since),
    supabase.from("water_logs").select("log_date, amount_ml").eq("user_id", user.id).gte("log_date", since),
    supabase.from("sleep_logs").select("log_date, hours, quality, bedtime, wake_ups").eq("user_id", user.id).gte("log_date", since),
    supabase.from("food_logs").select("log_date, calories, protein_g").eq("user_id", user.id).gte("log_date", since),
    supabase.from("symptom_logs").select("*").eq("user_id", user.id).gte("log_date", since),
    supabase
      .from("pet_care_logs")
      .select("log_date, milo_medication, milo_supplement, zoe_medication, zoe_supplement")
      .eq("user_id", user.id)
      .gte("log_date", since),
    supabase.from("workout_logs").select("log_date, workout_name").eq("user_id", user.id).gte("log_date", since),
    // full history, not just this window: an old period start can still be the
    // applicable one for the early days of the window.
    supabase.from("cycle_logs").select("period_start_date").eq("user_id", user.id).lte("period_start_date", today),
    supabase.from("pill_logs").select("log_date, taken").eq("user_id", user.id).gte("log_date", since),
  ]);

  const weightByDay = new Map((weights ?? []).map((w) => [w.log_date, w.weight_kg]));
  const sleepByDay = new Map((sleep ?? []).map((s) => [s.log_date, s]));
  const symptomByDay = new Map((symptoms ?? []).map((s) => [s.log_date, s]));
  const petCareByDay = new Map((petCare ?? []).map((p) => [p.log_date, p]));
  const movedDaySet = new Set((workouts ?? []).map((w) => w.log_date));
  const workoutNamesByDay = new Map<string, string[]>();
  for (const w of workouts ?? []) {
    if (!workoutNamesByDay.has(w.log_date)) workoutNamesByDay.set(w.log_date, []);
    workoutNamesByDay.get(w.log_date)!.push(w.workout_name);
  }
  const periodStarts = (periodLogs ?? []).map((p) => p.period_start_date);
  const avgCycleLength = profile?.avg_cycle_length ?? 28;
  const onBirthControl = profile?.on_birth_control ?? false;
  const tracksCycle = profile?.tracks_cycle ?? false;
  const pillByDay = new Map((pillLogs ?? []).map((p) => [p.log_date, p.taken]));

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
  const vacationSince = profile?.vacation_since ?? null;
  const vacationUntil = profile?.vacation_until ?? null;
  const isVacationDay = (d: string) =>
    vacationSince != null && vacationUntil != null && d >= vacationSince && d <= vacationUntil;

  const points: HistoryPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = shiftDateStr(today, -i);
    const symptom = symptomByDay.get(date);
    const sleep = sleepByDay.get(date);
    const waterMl = waterByDay.get(date) ?? 0;
    const sleepHours = sleep?.hours ?? null;
    const proteinG = proteinByDay.get(date) ?? 0;
    const pet = petCareByDay.get(date);
    const petCareDone = pet ? pet.milo_medication && pet.milo_supplement && pet.zoe_medication && pet.zoe_supplement : null;
    const movedToday = movedDaySet.has(date);
    // Tracked regardless of birth control (exogenous hormones don't
    // necessarily override her own cycle, especially with PCOS), but only
    // at all if this profile opted into cycle tracking.
    const cyclePhase = tracksCycle ? (estimateCycleForDate(date, periodStarts, avgCycleLength)?.phase ?? null) : null;

    const wellnessInputs: number[] = [];
    if (symptom?.mood != null) wellnessInputs.push(scale1to5(symptom.mood));
    if (symptom?.energy != null) wellnessInputs.push(scale1to5(symptom.energy));
    if (symptom?.irritability != null) wellnessInputs.push(100 - scale1to5(symptom.irritability));
    if (symptom?.stress_level != null) wellnessInputs.push(100 - scale1to5(symptom.stress_level));
    if (sleepHours != null) wellnessInputs.push(pct(sleepHours, sleepTarget));
    if (waterMl > 0) wellnessInputs.push(pct(waterMl, waterTarget));
    if (proteinG > 0) wellnessInputs.push(pct(proteinG, proteinTarget));
    // Movement isn't self-rated here — it's the real signal from Entreno
    // (workouts/walks). On a day inside her vacation window, not moving
    // isn't a real signal of anything — leave it out of the average instead
    // of scoring it 0, same as any other day with nothing logged.
    if (!isVacationDay(date)) wellnessInputs.push(movedToday ? 100 : 0);

    const wellness =
      wellnessInputs.length >= 2
        ? Math.round(wellnessInputs.reduce((a, b) => a + b, 0) / wellnessInputs.length)
        : null;

    points.push({
      date,
      weightKg: weightByDay.get(date) ?? null,
      waterMl,
      sleepHours,
      sleepQuality: sleep?.quality ?? null,
      sleepBedtime: sleep?.bedtime ?? null,
      sleepWakeUps: sleep?.wake_ups ?? null,
      calories: caloriesByDay.get(date) ?? 0,
      proteinG,
      mood: symptom?.mood ?? null,
      energy: symptom?.energy ?? null,
      irritability: symptom?.irritability ?? null,
      sensitivityLevel: symptom?.sensitivity_level ?? null,
      stressLevel: symptom?.stress_level ?? null,
      bloating: symptom?.bloating ?? null,
      alcoholUnits: symptom?.alcohol_units ?? null,
      tobaccoUsed: symptom?.tobacco_used ?? null,
      socialMediaMinutes: symptom?.social_media_minutes ?? null,
      socialContact: symptom?.social_contact ?? null,
      cloudCoverPct: symptom?.cloud_cover_pct ?? null,
      weatherCondition: symptom?.weather_condition ?? null,
      notes: symptom?.notes ?? null,
      notesValence: symptom?.notes_valence ?? null,
      cyclePhase,
      movedToday,
      workoutNames: workoutNamesByDay.get(date) ?? [],
      petCareDone,
      pillTaken: onBirthControl ? (pillByDay.get(date) ?? null) : null,
      wellness,
    });
  }
  return points;
}

// Accepts an already-fetched week of history so callers that already have
// getHistory(365) in hand (the Progress page) don't trigger a second,
// separate round of the same ~10 parallel table queries just for this.
export async function getWeeklyReview(last7Days?: HistoryPoint[]): Promise<WeeklyReview | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const [{ data: profile }, history] = await Promise.all([
    supabase.from("profiles").select("protein_target_g, water_target_ml, sleep_target_hours").eq("id", user.id).single(),
    last7Days ? Promise.resolve(last7Days) : getHistory(7),
  ]);

  const proteinTarget = profile?.protein_target_g ?? 90;
  const waterTarget = profile?.water_target_ml ?? 2000;
  const sleepTarget = profile?.sleep_target_hours ?? 7.5;

  const days = history.map((h) => {
    const weekday = new Date(h.date + "T00:00:00").getDay();
    return {
      date: h.date,
      isWeekend: weekday === 0 || weekday === 6,
      proteinPct: h.proteinG > 0 ? pct(h.proteinG, proteinTarget) : null,
      sleepHours: h.sleepHours,
      waterPct: h.waterMl > 0 ? pct(h.waterMl, waterTarget) : null,
      mood: h.mood,
      hasWorkout: h.movedToday,
      hasAnyLog: h.proteinG > 0 || h.waterMl > 0 || h.sleepHours != null || h.mood != null || h.movedToday,
    };
  });

  return buildWeeklyReview({ days, sleepTargetHours: sleepTarget });
}
