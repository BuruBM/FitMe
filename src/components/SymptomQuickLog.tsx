"use client";

import { useState, useTransition } from "react";
import { logSymptoms } from "@/lib/actions/tracking";

const BLOATING_LABELS = ["Nada", "Leve", "Moderado", "Mucho"];

export function SymptomQuickLog() {
  const [bloating, setBloating] = useState(0);
  const [energy, setEnergy] = useState(3);
  const [mood, setMood] = useState(3);
  const [irritability, setIrritability] = useState(1);
  const [alcoholUnits, setAlcoholUnits] = useState(0);
  const [tobaccoUsed, setTobaccoUsed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      await logSymptoms({ bloating, energy, mood, irritability, alcoholUnits, tobaccoUsed });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <section className="card p-4 space-y-3">
      <h2 className="font-semibold text-sm">¿Cómo te sentís hoy?</h2>
      <p className="text-xs text-muted -mt-2">
        Sin juicio, es solo para que vos puedas ver el patrón con el tiempo.
      </p>

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
      <RatingRow label="Irritabilidad" value={irritability} onChange={setIrritability} />

      <div className="grid grid-cols-2 gap-2 pt-1">
        <div>
          <p className="text-xs text-muted mb-1">Tragos de alcohol</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAlcoholUnits((n) => Math.max(0, n - 1))}
              className="stepper"
              type="button"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-medium">{alcoholUnits}</span>
            <button onClick={() => setAlcoholUnits((n) => n + 1)} className="stepper" type="button">
              +
            </button>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Tabaco</p>
          <button
            onClick={() => setTobaccoUsed((v) => !v)}
            className={`w-full text-xs rounded-md py-1.5 border ${
              tobaccoUsed ? "bg-primary text-primary-foreground border-primary" : "border-card-border text-muted"
            }`}
          >
            {tobaccoUsed ? "Fumé hoy" : "No fumé"}
          </button>
        </div>
      </div>

      <button
        onClick={save}
        disabled={isPending}
        className="w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 disabled:opacity-50"
      >
        {saved ? "Guardado ✓" : "Guardar"}
      </button>

      <style jsx global>{`
        .stepper {
          width: 2rem;
          height: 2rem;
          border-radius: 9999px;
          border: 1px solid var(--card-border);
          font-size: 1.1rem;
          line-height: 1;
        }
      `}</style>
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
