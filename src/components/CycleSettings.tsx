"use client";

import { useState, useTransition } from "react";
import { updateCycleSettings } from "@/lib/actions/cycle";

export function CycleSettings({
  avgCycleLength,
  onBirthControl,
}: {
  avgCycleLength: number;
  onBirthControl: boolean;
}) {
  const [length, setLength] = useState(avgCycleLength);
  const [pill, setPill] = useState(onBirthControl);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      await updateCycleSettings(length, pill);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <section className="card p-4">
      <h2 className="font-semibold text-sm mb-3">Ciclo y método anticonceptivo</h2>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted">Duración promedio del ciclo (días)</label>
          <input
            type="number"
            min={15}
            max={60}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={pill} onChange={(e) => setPill(e.target.checked)} />
          Estoy tomando pastillas anticonceptivas
        </label>
        <button
          onClick={save}
          disabled={isPending}
          className="w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 disabled:opacity-50"
        >
          {saved ? "Guardado ✓" : "Guardar"}
        </button>
      </div>
    </section>
  );
}
