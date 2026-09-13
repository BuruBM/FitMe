"use client";

import { useState, useTransition } from "react";
import { logMeasurements } from "@/lib/actions/tracking";
import type { BodyMeasurement } from "@/lib/database.types";

const FIELDS = [
  { key: "waist", label: "Cintura", placeholder: "ej: 78" },
  { key: "hip", label: "Cadera", placeholder: "opcional" },
] as const;
const EXTRA_FIELDS = [
  { key: "thigh", label: "Muslo", placeholder: "opcional" },
  { key: "arm", label: "Brazo", placeholder: "opcional" },
] as const;

function delta(latest: number | null, previous: number | null): string | null {
  if (latest == null || previous == null) return null;
  const diff = Math.round((latest - previous) * 10) / 10;
  if (diff === 0) return "sin cambios";
  return `${diff > 0 ? "+" : ""}${diff}cm desde la última medición`;
}

export function MeasurementsQuickLog({
  latest,
  previous,
}: {
  latest: BodyMeasurement | null;
  previous: BodyMeasurement | null;
}) {
  const [waist, setWaist] = useState(latest?.waist_cm?.toString() ?? "");
  const [hip, setHip] = useState(latest?.hip_cm?.toString() ?? "");
  const [thigh, setThigh] = useState(latest?.thigh_cm?.toString() ?? "");
  const [arm, setArm] = useState(latest?.arm_cm?.toString() ?? "");
  const [showExtra, setShowExtra] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const values = { waist, hip, thigh, arm };
  const setters = { waist: setWaist, hip: setHip, thigh: setThigh, arm: setArm };

  function save() {
    const n = (v: string) => (v ? Number(v) : null);
    if (!waist && !hip && !thigh && !arm) return;
    startTransition(async () => {
      await logMeasurements(n(waist), n(hip), n(thigh), n(arm));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const waistDelta = delta(latest?.waist_cm ?? null, previous?.waist_cm ?? null);

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-sm">Medidas corporales</h2>
        <button onClick={() => setShowExtra((v) => !v)} className="text-xs font-medium text-primary">
          {showExtra ? "Menos medidas" : "+ Muslo y brazo"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="text-xs text-muted">{f.label} (cm)</label>
            <input
              type="number"
              step="0.5"
              value={values[f.key]}
              onChange={(e) => setters[f.key](e.target.value)}
              placeholder={f.placeholder}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        ))}
        {showExtra &&
          EXTRA_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="text-xs text-muted">{f.label} (cm)</label>
              <input
                type="number"
                step="0.5"
                value={values[f.key]}
                onChange={(e) => setters[f.key](e.target.value)}
                placeholder={f.placeholder}
                className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          ))}
      </div>
      {waistDelta && <p className="text-[11px] text-muted mt-2">Cintura: {waistDelta}</p>}
      <button
        onClick={save}
        disabled={isPending || (!waist && !hip && !thigh && !arm)}
        className="mt-3 w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 disabled:opacity-50"
      >
        {saved ? "Guardado ✓" : "Guardar"}
      </button>
    </section>
  );
}
