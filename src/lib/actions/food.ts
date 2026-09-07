"use server";

import { revalidatePath } from "next/cache";
import { todayInAppTz } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";
import { awardXp } from "@/lib/actions/gamification-helpers";
import { XP_RULES } from "@/lib/gamification";
import type { MealType, FoodSource } from "@/lib/database.types";

export interface LogFoodInput {
  mealType: MealType;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sodiumMg: number;
  calciumMg: number;
  source: FoodSource;
  notes?: string;
  saveAsFavorite?: boolean;
}

export async function logFood(input: LogFoodInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticada");

  const today = todayInAppTz();

  const { error } = await supabase.from("food_logs").insert({
    user_id: user.id,
    log_date: today,
    meal_type: input.mealType,
    name: input.name,
    quantity: input.quantity,
    unit: input.unit,
    calories: input.calories,
    protein_g: input.proteinG,
    carbs_g: input.carbsG,
    fat_g: input.fatG,
    fiber_g: input.fiberG,
    sodium_mg: input.sodiumMg,
    calcium_mg: input.calciumMg,
    source: input.source,
    notes: input.notes ?? null,
  });
  if (error) throw error;

  if (input.saveAsFavorite) {
    await supabase.from("custom_foods").insert({
      user_id: user.id,
      name: input.name,
      default_unit: input.unit,
      default_quantity: input.quantity,
      calories: input.calories,
      protein_g: input.proteinG,
      carbs_g: input.carbsG,
      fat_g: input.fatG,
      fiber_g: input.fiberG,
      sodium_mg: input.sodiumMg,
      calcium_mg: input.calciumMg,
      is_favorite: true,
    });
  }

  await awardXp(supabase, user.id, XP_RULES.food_log);

  revalidatePath("/dashboard");
  revalidatePath("/food");
}

export async function deleteFoodLog(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticada");

  const { error } = await supabase.from("food_logs").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw error;

  revalidatePath("/dashboard");
  revalidatePath("/food");
}

export async function getFavoriteFoods() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("custom_foods")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_favorite", true)
    .order("created_at", { ascending: false })
    .limit(30);

  return data ?? [];
}
