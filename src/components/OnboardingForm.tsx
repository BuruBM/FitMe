"use client";

import { useState, useTransition } from "react";
import { completeOnboarding } from "@/lib/actions/profile";
import type { ActivityLevel, Goal } from "@/lib/database.types";

export function OnboardingForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("light");
  const [goal, setGoal] = useState<Goal>("lose_weight");
  const [wakeTime, setWakeTime] = useState("06:00");
  const [bloatingProne, setBloatingProne] = useState(true);
  const [osteopeniaRisk, setOsteopeniaRisk] = useState(true);
  const [tripDate, setTripDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!birthDate || !heightCm || !weightKg) {
      setError("Completá fecha de nacimiento, altura y peso para calcular tus objetivos.");
      return;
    }

    startTransition(async () => {
      try {
        await completeOnboarding({
          fullName,
          birthDate,
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
          activityLevel,
          goal,
          wakeTime,
          bloatingProne,
          osteopeniaRisk,
          tripDate: tripDate || null,
        });
      } catch (err) {
        if (err instanceof Error && err.message !== "NEXT_REDIRECT") {
          setError(err.message);
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      {error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{error}</p>
      )}

      <Field label="Nombre">
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="input"
          placeholder="Tu nombre"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha de nacimiento">
          <input
            type="date"
            required
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Altura (cm)">
          <input
            type="number"
            required
            min={100}
            max={220}
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="input"
            placeholder="165"
          />
        </Field>
      </div>

      <Field label="Peso actual (kg)">
        <input
          type="number"
          required
          min={30}
          max={200}
          step="0.1"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          className="input"
          placeholder="70"
        />
      </Field>

      <Field label="Nivel de actividad diaria (fuera del entrenamiento)">
        <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)} className="input">
          <option value="sedentary">Sedentaria (oficina, poco movimiento)</option>
          <option value="light">Liviana (algo de caminata/movimiento)</option>
          <option value="moderate">Moderada</option>
          <option value="active">Activa</option>
        </select>
      </Field>

      <Field label="Objetivo principal">
        <select value={goal} onChange={(e) => setGoal(e.target.value as Goal)} className="input">
          <option value="lose_weight">Bajar de peso y deshincharme</option>
          <option value="energy">Tener más energía (sin bajar de peso)</option>
          <option value="maintain">Mantener</option>
        </select>
      </Field>

      <Field label="Hora en la que te levantás">
        <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="input" />
      </Field>

      <Field label="Fecha del viaje a la playa (opcional)">
        <input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} className="input" />
      </Field>

      <div className="space-y-2 pt-1">
        <Toggle
          checked={bloatingProne}
          onChange={setBloatingProne}
          label="Me hincho con facilidad"
        />
        <Toggle
          checked={osteopeniaRisk}
          onChange={setOsteopeniaRisk}
          label="Tengo tendencia a la osteopenia"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary text-primary-foreground font-medium py-2.5 text-sm hover:opacity-90 transition disabled:opacity-60"
      >
        {isPending ? "Calculando..." : "Calcular mis objetivos"}
      </button>

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
        .input:focus {
          border-color: var(--primary);
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground/80">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--primary)]"
      />
      {label}
    </label>
  );
}
