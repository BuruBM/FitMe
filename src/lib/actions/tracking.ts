"use server";

import { revalidatePath } from "next/cache";
import { todayInAppTz } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";
import { awardXp } from "@/lib/actions/gamification-helpers";
import { XP_RULES } from "@/lib/gamification";

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
export async function logSleep(hours: number, quality: number, notes?: string) {
  const { supabase, user } = await requireUser();
  const today = todayInAppTz();

  const { error } = await supabase
    .from("sleep_logs")
    .upsert(
      { user_id: user.id, log_date: today, hours, quality, notes: notes ?? null },
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

// ---------------- symptoms ----------------
export async function logSymptoms(bloating: number, energy: number, mood: number, notes?: string) {
  const { supabase, user } = await requireUser();
  const today = todayInAppTz();

  const { error } = await supabase.from("symptom_logs").upsert(
    { user_id: user.id, log_date: today, bloating, energy, mood, notes: notes ?? null },
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
