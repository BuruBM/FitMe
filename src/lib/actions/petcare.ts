"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { todayInAppTz } from "@/lib/date";
import { awardXp } from "@/lib/actions/gamification-helpers";
import { XP_RULES } from "@/lib/gamification";

export interface PetCareInput {
  miloMedication: boolean;
  miloSupplement: boolean;
  zoeMedication: boolean;
  zoeSupplement: boolean;
}

function isComplete(input: PetCareInput): boolean {
  return input.miloMedication && input.miloSupplement && input.zoeMedication && input.zoeSupplement;
}

export async function logPetCare(input: PetCareInput, wasComplete: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticada");

  const today = todayInAppTz();

  const { error } = await supabase.from("pet_care_logs").upsert(
    {
      user_id: user.id,
      log_date: today,
      milo_medication: input.miloMedication,
      milo_supplement: input.miloSupplement,
      zoe_medication: input.zoeMedication,
      zoe_supplement: input.zoeSupplement,
    },
    { onConflict: "user_id,log_date" },
  );
  if (error) throw error;

  // Award XP once, the moment the day's checklist first becomes fully done —
  // not per toggle, so it can't be farmed by flipping a box on and off.
  if (!wasComplete && isComplete(input)) {
    await awardXp(supabase, user.id, XP_RULES.pet_care_done);
  }

  revalidatePath("/dashboard");
  revalidatePath("/progress");
}

export async function setPetCarePause(untilDate: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticada");

  const { error } = await supabase.from("profiles").update({ pet_care_paused_until: untilDate }).eq("id", user.id);
  if (error) throw error;

  revalidatePath("/dashboard");
}
