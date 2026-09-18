"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import type { BodyMeasurement } from "@/lib/database.types";

const FIELDS: { key: keyof BodyMeasurement; label: string }[] = [
  { key: "waist_cm", label: "Cintura" },
  { key: "abdomen_cm", label: "Abdomen" },
  { key: "hip_cm", label: "Cadera" },
  { key: "thigh_cm", label: "Muslo" },
  { key: "arm_cm", label: "Brazo" },
];

function delta(current: number | null, previous: number | null): string | null {
  if (current == null || previous == null) return null;
  const diff = Math.round((current - previous) * 10) / 10;
  if (diff === 0) return "sin cambios";
  return `${diff > 0 ? "+" : ""}${diff}cm`;
}

// logs comes sorted newest-first, so the "previous" measurement for delta
// purposes is the next item in the array (chronologically earlier).
export function MeasurementsHistory({ logs }: { logs: BodyMeasurement[] }) {
  const [open, setOpen] = useState(false);

  if (logs.length === 0) {
    return (
      <section className="card p-4">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <Ruler size={15} className="text-primary" />
          Historial de medidas
        </div>
        <p className="text-sm text-muted mt-1">Tus mediciones anteriores van a aparecer acá.</p>
      </section>
    );
  }

  const trackedFields = FIELDS.filter((f) => logs.some((l) => l[f.key] != null));

  return (
    <section className="card p-4">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-1.5">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <Ruler size={15} className="text-primary" />
          Historial de medidas
        </span>
        <span className="text-xs font-medium text-primary">{open ? "Ocultar" : "Ver historial"}</span>
      </button>
      {open && (
        <div className="space-y-2 max-h-80 overflow-y-auto mt-2">
          {logs.map((log, i) => {
            const previous = logs[i + 1] ?? null;
            return (
              <div key={log.id} className="border-b border-card-border last:border-0 pb-2 last:pb-0">
                <p className="text-xs font-medium capitalize">
                  {new Date(log.log_date + "T00:00:00").toLocaleDateString("es-AR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1">
                  {trackedFields.map((f) => {
                    const value = log[f.key] as number | null;
                    if (value == null) return null;
                    const d = previous ? delta(value, previous[f.key] as number | null) : null;
                    return (
                      <p key={f.key} className="text-xs text-muted">
                        {f.label}: <span className="font-medium text-foreground">{value}cm</span>
                        {d ? ` (${d})` : ""}
                      </p>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
