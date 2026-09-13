"use client";

import { useState, useTransition } from "react";
import { logMeasurements } from "@/lib/actions/tracking";

export function MeasurementsQuickLog({
  currentWaistCm,
  currentHipCm,
}: {
  currentWaistCm: number | null;
  currentHipCm: number | null;
}) {
  const [waist, setWaist] = useState(currentWaistCm?.toString() ?? "");
  const [hip, setHip] = useState(currentHipCm?.toString() ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    const waistNum = waist ? Number(waist) : null;
    const hipNum = hip ? Number(hip) : null;
    if (waistNum == null && hipNum == null) return;
    startTransition(async () => {
      await logMeasurements(waistNum, hipNum);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <section className="card p-4">
      <h2 className="font-semibold mb-1 text-sm">Medidas corporales</h2>
      <p className="text-xs text-muted mb-3">
        El peso no cuenta toda la historia, sobre todo con la hinchazón — la cintura suele reflejar mejor cómo te
        sentís con el cuerpo.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted">Cintura (cm)</label>
          <input
            type="number"
            step="0.5"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            placeholder="ej: 78"
            className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted">Cadera (cm)</label>
          <input
            type="number"
            step="0.5"
            value={hip}
            onChange={(e) => setHip(e.target.value)}
            placeholder="opcional"
            className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>
      <button
        onClick={save}
        disabled={isPending || (!waist && !hip)}
        className="mt-3 w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 disabled:opacity-50"
      >
        {saved ? "Guardado ✓" : "Guardar"}
      </button>
    </section>
  );
}
