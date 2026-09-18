"use client";

import { useMemo, useState } from "react";
import { Compass } from "lucide-react";
import { buildStats } from "@/components/DayDetailPanel";
import type { HistoryPoint } from "@/lib/queries";

type Period = "semana" | "mes";
const PERIOD_DAYS: Record<Period, number> = { semana: 7, mes: 30 };
const PERIOD_LABELS: Record<Period, string> = { semana: "Semana", mes: "Mes" };

// Not "no ánimo", "buen ánimo" etc. — a straight color scale so a bad day
// pops out visually while scanning, without editorializing about it.
function moodColor(mood: number): string {
  if (mood <= 2) return "var(--danger)";
  if (mood === 3) return "var(--accent)";
  return "var(--primary)";
}

// Every day she logged an ánimo, with everything else logged that same day
// right underneath it — no minimum-sample-size gating, no yes/no buckets.
// She reads the correlation herself: a low ánimo day next to what was
// actually going on (sueño, movimiento, comida, clima, ciclo...).
export function FactorsPanel({ history }: { history: HistoryPoint[] }) {
  const [period, setPeriod] = useState<Period>("semana");

  const days = useMemo(() => {
    const windowed = history.slice(-PERIOD_DAYS[period]);
    return windowed.filter((p) => p.mood != null).reverse(); // newest first
  }, [history, period]);

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Compass size={16} className="text-primary" />
          Cómo fue tu {period === "semana" ? "semana" : "mes"}
        </div>
        <div className="flex gap-1 shrink-0">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium border ${
                period === p ? "bg-primary text-primary-foreground border-primary" : "border-card-border text-muted"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {days.length === 0 ? (
        <p className="text-xs text-muted mt-2">
          No hay check-ins de &quot;¿Cómo te sentís hoy?&quot; en {period === "semana" ? "esta semana" : "este mes"} todavía.
        </p>
      ) : (
        <>
          <p className="text-[11px] text-muted mt-1 mb-3">
            Cada día que cargaste tu ánimo, con todo lo demás que registraste ese mismo día al lado.
          </p>
          <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-0.5">
            {days.map((point) => (
              <DayFactorRow key={point.date} point={point} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function DayFactorRow({ point }: { point: HistoryPoint }) {
  const dateLabel = new Date(point.date + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const stats = buildStats(point).filter((s) => s.label !== "Ánimo");

  return (
    <div className="rounded-lg border border-card-border p-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium capitalize">{dateLabel}</p>
        <span
          className="text-xs font-semibold rounded-full px-2 py-0.5"
          style={{ color: moodColor(point.mood!), background: "var(--background)" }}
        >
          Ánimo {point.mood}/5
        </span>
      </div>
      {stats.length > 0 ? (
        <div className="grid grid-cols-3 gap-x-3 gap-y-1 mt-2 text-[11px]">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-muted">{s.label}</p>
              <p className="font-medium leading-tight">{s.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-muted mt-1.5">No cargaste nada más ese día.</p>
      )}
    </div>
  );
}
