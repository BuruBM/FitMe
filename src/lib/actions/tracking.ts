"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { todayInAppTz } from "@/lib/date";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { awardXp } from "@/lib/actions/gamification-helpers";
import { XP_RULES } from "@/lib/gamification";
import { fetchCurrentWeather } from "@/lib/weather";
import { estimateSleepQuality } from "@/lib/sleep";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autenticada");
  const supabase = await createClient();
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
      quality: estimateSleepQuality(input.hours, input.wakeUps ?? 0),
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
export async function logMeasurements(
  waistCm: number | null,
  hipCm: number | null,
  thighCm: number | null,
  armCm: number | null,
) {
  const { supabase, user } = await requireUser();
  const today = todayInAppTz();

  const { error } = await supabase
    .from("body_measurements")
    .upsert(
      { user_id: user.id, log_date: today, waist_cm: waistCm, hip_cm: hipCm, thigh_cm: thighCm, arm_cm: armCm },
      { onConflict: "user_id,log_date" },
    );
  if (error) throw error;

  await awardXp(supabase, user.id, XP_RULES.weight_log);
  revalidatePath("/progress");
}

// ---------------- symptoms ----------------
export interface SymptomInput {
  bloating: number | null;
  energy: number | null;
  mood: number | null;
  irritability: number | null;
  sensitivityLevel: number | null;
  alcoholUnits: number;
  tobaccoUsed: boolean;
  socialMediaMinutes?: number;
  socialContact?: number | null;
  stressLevel?: number | null;
  notesValence?: number;
  notes?: string;
}

export async function logSymptoms(input: SymptomInput) {
  const { supabase, user } = await requireUser();
  const today = todayInAppTz();

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

  // Attaching weather isn't worth making her wait on: it fetches an external
  // API that can take seconds on a cold cache. Save the check-in immediately
  // and fill in cloud cover/condition afterward, best-effort.
  after(async () => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("latitude, longitude")
      .eq("id", user.id)
      .single();
    if (profile?.latitude == null || profile?.longitude == null) return;

    const weather = await fetchCurrentWeather(profile.latitude, profile.longitude);
    if (!weather) return;

    await supabase
      .from("symptom_logs")
      .update({ cloud_cover_pct: weather.cloudCoverPct, weather_condition: weather.condition })
      .eq("user_id", user.id)
      .eq("log_date", today);
  });
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
