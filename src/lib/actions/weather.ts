"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { geocodeCity } from "@/lib/weather";

export async function updateCity(city: string): Promise<{ ok: boolean; resolvedName?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticada");

  const geo = await geocodeCity(city);
  if (!geo) return { ok: false };

  const { error } = await supabase
    .from("profiles")
    .update({ city: geo.name, latitude: geo.latitude, longitude: geo.longitude })
    .eq("id", user.id);
  if (error) throw error;

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { ok: true, resolvedName: geo.name };
}
