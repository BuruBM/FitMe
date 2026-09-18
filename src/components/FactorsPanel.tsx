"use client";

import { useMemo, useState } from "react";
import { Compass } from "lucide-react";
import { computeFactors, type FactorComparison, type FactorGroup } from "@/lib/factors";
import type { HistoryPoint } from "@/lib/queries";

const MOOD_MAX = 5;
type Period = "semana" | "mes";
const PERIOD_DAYS: Record<Period, number> = { semana: 7, mes: 30 };
const PERIOD_LABELS: Record<Period, string> = { semana: "Semana", mes: "Mes" };

export function FactorsPanel({ history }: { history: HistoryPoint[] }) {
  const [period, setPeriod] = useState<Period>("semana");

  const factors = useMemo(() => computeFactors(history.slice(-PERIOD_DAYS[period])), [history, period]);

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Compass size={16} className="text-primary" />
          Factores que afectan tu ánimo
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

      {factors.length === 0 ? (
        <p className="text-xs text-muted mt-2">
          Todavía no hay suficiente variación en {period === "semana" ? "esta semana" : "este mes"} para comparar —
          necesitás al menos un ánimo cargado y algo de esa variable en dos días distintos.
        </p>
      ) : (
        <>
          <p className="text-[11px] text-muted mt-1 mb-3">
            Ánimo promedio (1 a 5) de {period === "semana" ? "los últimos 7 días" : "los últimos 30 días"}, según más
            o menos de cada cosa. El número entre paréntesis es cuántos días respaldan esa barra.
          </p>
          <div className="space-y-4">
            {factors.map((f) => (
              <FactorRow key={f.id} factor={f} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function FactorRow({ factor }: { factor: FactorComparison }) {
  const max = Math.max(...factor.groups.map((g) => g.avg));
  const min = Math.min(...factor.groups.map((g) => g.avg));

  return (
    <div>
      <p className="text-xs font-semibold mb-1.5">{factor.label}</p>
      <div className="space-y-1">
        {factor.groups.map((g) => (
          <BarRow key={g.label} group={g} isHigh={g.avg === max} isLow={g.avg === min && max !== min} />
        ))}
      </div>
    </div>
  );
}

function BarRow({ group, isHigh, isLow }: { group: FactorGroup; isHigh: boolean; isLow: boolean }) {
  const pct = Math.min(100, Math.max(4, (group.avg / MOOD_MAX) * 100));
  const color = isHigh ? "var(--factor-high)" : isLow ? "var(--factor-low)" : "var(--muted)";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted w-28 shrink-0 truncate" title={group.label}>
        {group.label}
      </span>
      <div className="flex-1 h-2.5 rounded-full bg-background overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] font-medium w-20 text-right shrink-0">
        {group.avg}/5 <span className="text-muted">({group.n}d)</span>
      </span>
    </div>
  );
}
