"use client";

import { useState } from "react";
import { EditProfileForm } from "@/components/EditProfileForm";
import type { Profile } from "@/lib/database.types";

export function ProfileTargets({ profile }: { profile: Profile }) {
  const [editing, setEditing] = useState(false);

  if (editing) return <EditProfileForm profile={profile} onDone={() => setEditing(false)} />;

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{profile.full_name || "Tus objetivos"}</h2>
        <button onClick={() => setEditing(true)} className="text-sm text-primary font-medium">
          Editar
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
        <Stat label="Calorías/día" value={`${profile.calorie_target ?? "-"} kcal`} />
        <Stat label="Proteína" value={`${profile.protein_target_g ?? "-"} g`} />
        <Stat label="Carbohidratos" value={`${profile.carb_target_g ?? "-"} g`} />
        <Stat label="Grasas" value={`${profile.fat_target_g ?? "-"} g`} />
        <Stat label="Calcio" value={`${profile.calcium_target_mg ?? "-"} mg`} />
        <Stat label="Sodio máx." value={`${profile.sodium_limit_mg ?? "-"} mg`} />
        <Stat label="Agua" value={`${((profile.water_target_ml ?? 0) / 1000).toFixed(1)} L`} />
        <Stat label="Sueño" value={`${profile.sleep_target_hours} h`} />
      </div>
      {profile.trip_date && (
        <p className="text-xs text-muted mt-3 pt-3 border-t border-card-border">
          Viaje a la playa: {new Date(profile.trip_date + "T00:00:00").toLocaleDateString("es-AR")}
        </p>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
