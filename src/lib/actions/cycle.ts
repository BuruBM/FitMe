"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { todayInAppTz } from "@/lib/date";
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

export async function logPeriodStart(dateStr?: string) {
  const { supabase, user } = await requireUser();
  const date = dateStr || todayInAppTz();

  const { error } = await supabase
    .from("cycle_logs")
    .upsert({ user_id: user.id, period_start_date: date }, { onConflict: "user_id,period_start_date" });
  if (error) throw error;

  await awardXp(supabase, user.id, XP_RULES.symptom_log);
  revalidatePath("/dashboard");
  revalidatePath("/progress");
}

export async function setPillTaken(taken: boolean) {
  const { supabase, user } = await requireUser();
  const today = todayInAppTz();

  const { error } = await supabase
    .from("pill_logs")
    .upsert({ user_id: user.id, log_date: today, taken }, { onConflict: "user_id,log_date" });
  if (error) throw error;

  if (taken) await awardXp(supabase, user.id, XP_RULES.food_log);
  revalidatePath("/dashboard");
}

export async function updateCycleSettings(avgCycleLength: number, onBirthControl: boolean, pillStartedOn: string | null) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("profiles")
    .update({
      avg_cycle_length: avgCycleLength,
      on_birth_control: onBirthControl,
      pill_started_on: onBirthControl ? pillStartedOn : null,
    })
    .eq("id", user.id);
  if (error) throw error;

  revalidatePath("/dashboard");
  revalidatePath("/profile");
}
