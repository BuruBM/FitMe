"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { todayInAppTz } from "@/lib/date";

export interface PetCareInput {
  miloMedication: boolean;
  miloSupplement: boolean;
  zoeMedication: boolean;
  zoeSupplement: boolean;
}

export async function logPetCare(input: PetCareInput) {
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

  revalidatePath("/dashboard");
}
