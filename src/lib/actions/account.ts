"use server";

import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

// Every table that holds day-to-day entries, as opposed to profile/account
// setup. Used by the "start over" reset so she can test the app without
// carrying around fake data — it never touches profiles or auth.
const LOG_TABLES = [
  "food_logs",
  "water_logs",
  "sleep_logs",
  "weight_logs",
  "symptom_logs",
  "workout_logs",
  "cycle_logs",
  "pill_logs",
  "pet_care_logs",
  "body_measurements",
] as const;

export async function resetAllLogs() {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autenticada");
  const supabase = await createClient();

  const results = await Promise.all(
    LOG_TABLES.map((table) => supabase.from(table).delete().eq("user_id", user.id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;

  await supabase
    .from("gamification_state")
    .update({ xp: 0, level: 1, current_streak: 0, longest_streak: 0, last_activity_date: null, badges: [] })
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/progress");
  revalidatePath("/food");
  revalidatePath("/workouts");
  revalidatePath("/profile");
}
