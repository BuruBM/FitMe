"use server";

import { revalidatePath } from "next/cache";
import { todayInAppTz } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";
import { awardXp } from "@/lib/actions/gamification-helpers";
import { XP_RULES } from "@/lib/gamification";
import { fetchCurrentWeather } from "@/lib/weather";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticada");
  return { supabase, user };
}

// ---------------- water ----------------
export async function logWater(amountMl: number) {
  const { supabase, user } = await requireUser();
  const today = todayInAppTz();

  const { error } = await supabase.from("water_logs").insert({
    user_id: user.id,
    log_date: today,
    amount_ml: amountMl,
  });
  if (error) throw error;

  await awardXp(supabase, user.id, XP_RULES.food_log); // small bump per log
  revalidatePath("/dashboard");
  revalidatePath("/food");
}

// ---------------- sleep ----------------
export interface SleepInput {
  hours: number;
  quality: number;
  bedtime?: string;
  wakeUps?: number;
  notes?: string;
}

export async function logSleep(input: SleepInput) {
  const { supabase, user } = await requireUser();
  const today = todayInAppTz();

  const { error } = await supabase.from("sleep_logs").upsert(
    {
      user_id: user.id,
      log_date: today,
      hours: input.hours,
      quality: input.quality,
      bedtime: input.bedtime ?? null,
      wake_ups: input.wakeUps ?? 0,
      notes: input.notes ?? null,
    },
    { onConflict: "user_id,log_date" },
  );
  if (error) throw error;

  await awardXp(supabase, user.id, XP_RULES.sleep_log);
  revalidatePath("/dashboard");
  revalidatePath("/progress");
}

// ---------------- weight ----------------
export async function logWeight(weightKg: number) {
  const { supabase, user } = await requireUser();
  const today = todayInAppTz();

  const { error } = await supabase
    .from("weight_logs")
    .upsert({ user_id: user.id, log_date: today, weight_kg: weightKg }, { onConflict: "user_id,log_date" });
  if (error) throw error;

  await supabase.from("profiles").update({ weight_kg: weightKg }).eq("id", user.id);

  await awardXp(supabase, user.id, XP_RULES.weight_log);
  revalidatePath("/dashboard");
  revalidatePath("/progress");
}

// ---------------- body measurements ----------------
export async function logMeasurements(waistCm: number | null, hipCm: number | null) {
  const { supabase, user } = await requireUser();
  const today = todayInAppTz();

  const { error } = await supabase
    .from("body_measurements")
    .upsert(
      { user_id: user.id, log_date: today, waist_cm: waistCm, hip_cm: hipCm },
      { onConflict: "user_id,log_date" },
    );
  if (error) throw error;

  await awardXp(supabase, user.id, XP_RULES.weight_log);
  revalidatePath("/progress");
}

// ---------------- symptoms ----------------
export interface SymptomInput {
  bloating: number;
  energy: number;
  mood: number;
  irritability: number;
  sensitivityLevel: number;
  alcoholUnits: number;
  tobaccoUsed: boolean;
  socialMediaMinutes?: number;
  socialContact?: number;
  stressLevel?: number;
  notesValence?: number;
  notes?: string;
}

export async function logSymptoms(input: SymptomInput) {
  const { supabase, user } = await requireUser();
  const today = todayInAppTz();

  const { data: profile } = await supabase
    .from("profiles")
    .select("latitude, longitude")
    .eq("id", user.id)
    .single();

  const weather =
    profile?.latitude != null && profile?.longitude != null
      ? await fetchCurrentWeather(profile.latitude, profile.longitude)
      : null;

  const { error } = await supabase.from("symptom_logs").upsert(
    {
      user_id: user.id,
      log_date: today,
      bloating: input.bloating,
      energy: input.energy,
      mood: input.mood,
      irritability: input.irritability,
      sensitivity_level: input.sensitivityLevel,
      alcohol_units: input.alcoholUnits,
      tobacco_used: input.tobaccoUsed,
      cloud_cover_pct: weather?.cloudCoverPct ?? null,
      weather_condition: weather?.condition ?? null,
      social_media_minutes: input.socialMediaMinutes ?? null,
      social_contact: input.socialContact ?? null,
      stress_level: input.stressLevel ?? null,
      notes_valence: input.notesValence ?? null,
      notes: input.notes ?? null,
    },
    { onConflict: "user_id,log_date" },
  );
  if (error) throw error;

  await awardXp(supabase, user.id, XP_RULES.symptom_log);
  revalidatePath("/dashboard");
  revalidatePath("/progress");
}

// ---------------- workouts ----------------
export async function logWorkout(workoutId: string, workoutName: string, durationMin: number, intensity: "bajo" | "medio" | "alto") {
  const { supabase, user } = await requireUser();
  const today = todayInAppTz();

  const { error } = await supabase.from("workout_logs").insert({
    user_id: user.id,
    log_date: today,
    workout_id: workoutId,
    workout_name: workoutName,
    duration_min: durationMin,
    intensity,
  });
  if (error) throw error;

  await awardXp(supabase, user.id, XP_RULES.workout_done);
  revalidatePath("/dashboard");
  revalidatePath("/workouts");
}
