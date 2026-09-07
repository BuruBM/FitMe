"use client";

import { useState, useTransition } from "react";
import { logWeight } from "@/lib/actions/tracking";

export function WeightQuickLog({ currentWeightKg }: { currentWeightKg: number | null }) {
  const [weight, setWeight] = useState(currentWeightKg?.toString() ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    const value = Number(weight);
    if (!value) return;
    startTransition(async () => {
      await logWeight(value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <section className="card p-4">
      <h2 className="font-semibold mb-2 text-sm">Registrar peso de hoy</h2>
      <div className="flex gap-2">
        <input
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="kg"
          className="flex-1 rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={save}
          disabled={isPending || !weight}
          className="rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 disabled:opacity-50"
        >
          {saved ? "✓" : "Guardar"}
        </button>
      </div>
    </section>
  );
}
