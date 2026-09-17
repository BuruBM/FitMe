"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { todayInAppTz } from "@/lib/date";
import { awardXp } from "@/lib/actions/gamification-helpers";
import { XP_RULES } from "@/lib/gamification";

export interface PetCareInput {
  miloMedication: boolean;
  miloSupplement: boolean;
  zoeMedication: boolean;
  zoeSupplement: boolean;
}

export async function logPetCare(input: PetCareInput, date?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autenticada");
  const supabase = await createClient();

  const day = date ?? todayInAppTz();

  const { data: existing } = await supabase
    .from("pet_care_logs")
    .select("milo_medication, milo_supplement, zoe_medication, zoe_supplement")
    .eq("user_id", user.id)
    .eq("log_date", day)
    .maybeSingle();

  const { error } = await supabase.from("pet_care_logs").upsert(
    {
      user_id: user.id,
      log_date: day,
      milo_medication: input.miloMedication,
      milo_supplement: input.miloSupplement,
      zoe_medication: input.zoeMedication,
      zoe_supplement: input.zoeSupplement,
    },
    { onConflict: "user_id,log_date" },
  );
  if (error) throw error;

  // Award XP per task the moment it's first checked today — proportional to
  // how much she actually did, not one all-or-nothing bonus. Comparing
  // against the row's previously saved state (not a client-supplied flag)
  // means unchecking and rechecking the same box can't re-earn it.
  const prev = existing ?? { milo_medication: false, milo_supplement: false, zoe_medication: false, zoe_supplement: false };
  let newlyDone = 0;
  if (input.miloMedication && !prev.milo_medication) newlyDone++;
  if (input.miloSupplement && !prev.milo_supplement) newlyDone++;
  if (input.zoeMedication && !prev.zoe_medication) newlyDone++;
  if (input.zoeSupplement && !prev.zoe_supplement) newlyDone++;
  if (newlyDone > 0) {
    await awardXp(supabase, user.id, XP_RULES.pet_care_item * newlyDone);
  }

  // The checklist already flips instantly on screen (optimistic local
  // state), so refresh the cached pages in the background instead of
  // making every tap wait on a full page re-render.
  after(() => {
    revalidatePath("/dashboard");
    revalidatePath("/progress");
    revalidatePath("/day/[date]", "page");
  });
}

export async function setPetCarePause(untilDate: string | null) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autenticada");
  const supabase = await createClient();

  const { error } = await supabase.from("profiles").update({ pet_care_paused_until: untilDate }).eq("id", user.id);
  if (error) throw error;

  after(() => revalidatePath("/dashboard"));
}
