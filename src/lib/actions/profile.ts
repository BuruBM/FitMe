"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calculateNutritionTargets } from "@/lib/nutrition";
import { todayInAppTz } from "@/lib/date";
import type { ActivityLevel, Goal } from "@/lib/database.types";

export interface OnboardingInput {
  fullName: string;
  birthDate: string;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  wakeTime: string;
  bloatingProne: boolean;
  osteopeniaRisk: boolean;
  tripDate: string | null;
}

export async function completeOnboarding(input: OnboardingInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticada");

  const targets = calculateNutritionTargets({
    sex: "female",
    birthDate: input.birthDate,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    activityLevel: input.activityLevel,
    goal: input.goal,
    osteopeniaRisk: input.osteopeniaRisk,
    bloatingProne: input.bloatingProne,
  });

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      birth_date: input.birthDate,
      height_cm: input.heightCm,
      weight_kg: input.weightKg,
      activity_level: input.activityLevel,
      goal: input.goal,
      wake_time: input.wakeTime,
      bloating_prone: input.bloatingProne,
      osteopenia_risk: input.osteopeniaRisk,
      trip_date: input.tripDate,
      calorie_target: targets.calorieTarget,
      protein_target_g: targets.proteinTargetG,
      carb_target_g: targets.carbTargetG,
      fat_target_g: targets.fatTargetG,
      fiber_target_g: targets.fiberTargetG,
      calcium_target_mg: targets.calciumTargetMg,
      sodium_limit_mg: targets.sodiumLimitMg,
      water_target_ml: targets.waterTargetMl,
      onboarded: true,
    })
    .eq("id", user.id);
  if (error) throw error;

  // seed initial weight log so the progress chart has a starting point
  await supabase
    .from("weight_logs")
    .upsert(
      { user_id: user.id, log_date: todayInAppTz(), weight_kg: input.weightKg },
      { onConflict: "user_id,log_date" },
    );

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateProfile(input: OnboardingInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticada");

  const targets = calculateNutritionTargets({
    sex: "female",
    birthDate: input.birthDate,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    activityLevel: input.activityLevel,
    goal: input.goal,
    osteopeniaRisk: input.osteopeniaRisk,
    bloatingProne: input.bloatingProne,
  });

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      birth_date: input.birthDate,
      height_cm: input.heightCm,
      weight_kg: input.weightKg,
      activity_level: input.activityLevel,
      goal: input.goal,
      wake_time: input.wakeTime,
      bloating_prone: input.bloatingProne,
      osteopenia_risk: input.osteopeniaRisk,
      trip_date: input.tripDate,
      calorie_target: targets.calorieTarget,
      protein_target_g: targets.proteinTargetG,
      carb_target_g: targets.carbTargetG,
      fat_target_g: targets.fatTargetG,
      fiber_target_g: targets.fiberTargetG,
      calcium_target_mg: targets.calciumTargetMg,
      sodium_limit_mg: targets.sodiumLimitMg,
      water_target_ml: targets.waterTargetMl,
    })
    .eq("id", user.id);
  if (error) throw error;

  revalidatePath("/dashboard");
  revalidatePath("/profile");
}

export interface ManualTargets {
  calorieTarget: number;
  proteinTargetG: number;
  carbTargetG: number;
  fatTargetG: number;
}

export async function updateTargetsManually(targets: ManualTargets) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticada");

  const { error } = await supabase
    .from("profiles")
    .update({
      calorie_target: targets.calorieTarget,
      protein_target_g: targets.proteinTargetG,
      carb_target_g: targets.carbTargetG,
      fat_target_g: targets.fatTargetG,
    })
    .eq("id", user.id);
  if (error) throw error;

  revalidatePath("/dashboard");
  revalidatePath("/profile");
}

export async function updateTripDate(tripDate: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticada");

  await supabase.from("profiles").update({ trip_date: tripDate }).eq("id", user.id);
  revalidatePath("/dashboard");
  revalidatePath("/profile");
}
