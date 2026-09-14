"use server";

import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { searchCities, type GeocodeResult } from "@/lib/weather";

export async function searchCitySuggestions(query: string): Promise<GeocodeResult[]> {
  return searchCities(query);
}

export async function saveCitySelection(city: GeocodeResult): Promise<{ ok: boolean; resolvedName?: string }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autenticada");
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ city: city.name, latitude: city.latitude, longitude: city.longitude })
    .eq("id", user.id);
  if (error) throw error;

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { ok: true, resolvedName: city.name };
}
