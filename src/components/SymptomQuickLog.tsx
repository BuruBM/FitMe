"use client";

import { useState, useTransition } from "react";
import { logSymptoms } from "@/lib/actions/tracking";

const BLOATING_LABELS = ["Nada", "Leve", "Moderado", "Mucho"];

export function SymptomQuickLog() {
  const [bloating, setBloating] = useState(0);
  const [energy, setEnergy] = useState(3);
  const [mood, setMood] = useState(3);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      await logSymptoms(bloating, energy, mood);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <section className="card p-4 space-y-3">
      <h2 className="font-semibold text-sm">¿Cómo te sentís hoy?</h2>

      <div>
        <p className="text-xs text-muted mb-1">Hinchazón</p>
        <div className="flex gap-1.5">
          {BLOATING_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => setBloating(i)}
              className={`flex-1 text-xs rounded-md py-1.5 border ${
                bloating === i ? "bg-primary text-primary-foreground border-primary" : "border-card-border text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <RatingRow label="Energía" value={energy} onChange={setEnergy} />
      <RatingRow label="Ánimo" value={mood} onChange={setMood} />

      <button
        onClick={save}
        disabled={isPending}
        className="w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 disabled:opacity-50"
      >
        {saved ? "Guardado ✓" : "Guardar"}
      </button>
    </section>
  );
}

function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <p className="text-xs text-muted mb-1">{label}</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 text-xs rounded-md py-1.5 border ${
              value === n ? "bg-primary text-primary-foreground border-primary" : "border-card-border text-muted"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
