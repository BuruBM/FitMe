"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/profile";
import type { ActivityLevel, Goal, Profile } from "@/lib/database.types";

export function EditProfileForm({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [sex, setSex] = useState<"female" | "male">(profile.sex === "male" ? "male" : "female");
  const [birthDate, setBirthDate] = useState(profile.birth_date ?? "");
  const [heightCm, setHeightCm] = useState(profile.height_cm?.toString() ?? "");
  const [weightKg, setWeightKg] = useState(profile.weight_kg?.toString() ?? "");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activity_level);
  const [goal, setGoal] = useState<Goal>(profile.goal);
  const [wakeTime, setWakeTime] = useState(profile.wake_time?.slice(0, 5) ?? "06:00");
  const [bloatingProne, setBloatingProne] = useState(profile.bloating_prone);
  const [osteopeniaRisk, setOsteopeniaRisk] = useState(profile.osteopenia_risk);
  const [pcos, setPcos] = useState(profile.pcos);
  const [tracksCycle, setTracksCycle] = useState(profile.tracks_cycle);
  const [tracksPets, setTracksPets] = useState(profile.tracks_pets);
  const [tripDate, setTripDate] = useState(profile.trip_date ?? "");

  function save() {
    startTransition(async () => {
      await updateProfile({
        fullName,
        sex,
        birthDate,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        activityLevel,
        goal,
        wakeTime,
        bloatingProne,
        osteopeniaRisk,
        pcos: tracksCycle && pcos,
        tracksCycle,
        tracksPets,
        tripDate: tripDate || null,
      });
      onDone();
    });
  }

  return (
    <div className="card p-4 space-y-3">
      <Field label="Nombre">
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" />
      </Field>
      <Field label="Sexo (para calcular objetivos calóricos)">
        <select value={sex} onChange={(e) => setSex(e.target.value as "female" | "male")} className="input">
          <option value="female">Mujer</option>
          <option value="male">Varón</option>
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Nacimiento">
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="input" />
        </Field>
        <Field label="Altura (cm)">
          <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="input" />
        </Field>
      </div>
      <Field label="Peso (kg)">
        <input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="input" />
      </Field>
      <Field label="Actividad diaria">
        <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)} className="input">
          <option value="sedentary">Sedentaria</option>
          <option value="light">Liviana</option>
          <option value="moderate">Moderada</option>
          <option value="active">Activa</option>
        </select>
      </Field>
      <Field label="Objetivo">
        <select value={goal} onChange={(e) => setGoal(e.target.value as Goal)} className="input">
          <option value="lose_weight">Bajar de peso y deshincharme</option>
          <option value="energy">Más energía</option>
          <option value="maintain">Mantener</option>
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Hora que te levantás">
          <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="input" />
        </Field>
        <Field label="Viaje a la playa">
          <input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} className="input" />
        </Field>
      </div>

      <div className="space-y-2 pt-2 border-t border-card-border">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">Qué trackeo</p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={tracksCycle} onChange={(e) => setTracksCycle(e.target.checked)} />
          Ciclo hormonal (período, fase, pastilla)
        </label>
        {tracksCycle && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={pcos} onChange={(e) => setPcos(e.target.checked)} />
            Tengo SOP (síndrome de ovario poliquístico)
          </label>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={tracksPets} onChange={(e) => setTracksPets(e.target.checked)} />
          Cuidado de mascotas (medicación/suplementos)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={bloatingProne} onChange={(e) => setBloatingProne(e.target.checked)} />
          Me hincho con facilidad
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={osteopeniaRisk} onChange={(e) => setOsteopeniaRisk(e.target.checked)} />
          Tendencia a osteopenia
        </label>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onDone} className="flex-1 rounded-lg border border-card-border text-sm py-2">
          Cancelar
        </button>
        <button
          onClick={save}
          disabled={isPending}
          className="flex-1 rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--card-border);
          background: var(--background);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
