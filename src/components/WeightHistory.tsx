"use client";

import { useState } from "react";
import { Scale } from "lucide-react";
import type { WeightLog } from "@/lib/database.types";

// logs comes sorted newest-first, so the earliest entry (start) is the last
// item and the latest entry (now) is the first — shown up top as a quick
// "dónde empecé vs. dónde estoy" summary before the full list.
export function WeightHistory({ logs }: { logs: WeightLog[] }) {
  const [open, setOpen] = useState(false);

  if (logs.length === 0) {
    return (
      <section className="card p-4">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <Scale size={15} className="text-primary" />
          Historial de peso
        </div>
        <p className="text-sm text-muted mt-1">Tus registros de peso anteriores van a aparecer acá.</p>
      </section>
    );
  }

  const latest = logs[0];
  const start = logs[logs.length - 1];
  const totalDiff = Math.round((latest.weight_kg - start.weight_kg) * 10) / 10;

  return (
    <section className="card p-4">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-1.5">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <Scale size={15} className="text-primary" />
          Historial de peso
        </span>
        <span className="text-xs font-medium text-primary">{open ? "Ocultar" : "Ver historial"}</span>
      </button>

      {logs.length > 1 && (
        <p className="text-xs text-muted mt-1">
          Empezaste con {start.weight_kg}kg, ahora estás en {latest.weight_kg}kg
          {totalDiff !== 0 && ` (${totalDiff > 0 ? "+" : ""}${totalDiff}kg)`}.
        </p>
      )}

      {open && (
        <div className="space-y-1.5 max-h-80 overflow-y-auto mt-2">
          {logs.map((log, i) => {
            const previous = logs[i + 1] ?? null;
            const diff = previous ? Math.round((log.weight_kg - previous.weight_kg) * 10) / 10 : null;
            return (
              <div
                key={log.id}
                className="flex items-center justify-between border-b border-card-border last:border-0 pb-1.5 last:pb-0"
              >
                <p className="text-xs font-medium capitalize">
                  {new Date(log.log_date + "T00:00:00").toLocaleDateString("es-AR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
                <p className="text-xs text-muted">
                  <span className="font-medium text-foreground">{log.weight_kg}kg</span>
                  {diff != null && diff !== 0 ? ` (${diff > 0 ? "+" : ""}${diff}kg)` : ""}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
