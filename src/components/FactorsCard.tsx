"use client";

import { useMemo, useState } from "react";
import { Compass } from "lucide-react";
import type { FactorComparison, FactorGroup } from "@/lib/factors";
import type { HistoryPoint } from "@/lib/queries";

type Period = "semana" | "mes";
const PERIOD_DAYS: Record<Period, number> = { semana: 7, mes: 30 };
const PERIOD_LABELS: Record<Period, string> = { semana: "Semana", mes: "Mes" };

export function FactorsCard({
  title,
  history,
  scaleMax,
  computeFn,
  emptyHint,
}: {
  title: string;
  history: HistoryPoint[];
  scaleMax: number;
  computeFn: (points: HistoryPoint[]) => FactorComparison[];
  emptyHint: string;
}) {
  const [period, setPeriod] = useState<Period>("semana");

  const factors = useMemo(() => computeFn(history.slice(-PERIOD_DAYS[period])), [history, period, computeFn]);

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Compass size={16} className="text-primary" />
          {title}
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
        <p className="text-xs text-muted mt-2">{emptyHint}</p>
      ) : (
        <>
          <p className="text-[11px] text-muted mt-1 mb-3">
            Promedio (1 a {scaleMax}) de {period === "semana" ? "los últimos 7 días" : "los últimos 30 días"}, según
            más o menos de cada cosa. El número entre paréntesis es cuántos días respaldan esa barra.
          </p>
          <div className="space-y-4">
            {factors.map((f) => (
              <FactorRow key={f.id} factor={f} scaleMax={scaleMax} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function FactorRow({ factor, scaleMax }: { factor: FactorComparison; scaleMax: number }) {
  const max = Math.max(...factor.groups.map((g) => g.avg));
  const min = Math.min(...factor.groups.map((g) => g.avg));

  return (
    <div>
      <p className="text-xs font-semibold mb-1.5">{factor.label}</p>
      <div className="space-y-1">
        {factor.groups.map((g) => (
          <BarRow key={g.label} group={g} scaleMax={scaleMax} isHigh={g.avg === max} isLow={g.avg === min && max !== min} />
        ))}
      </div>
    </div>
  );
}

function BarRow({
  group,
  scaleMax,
  isHigh,
  isLow,
}: {
  group: FactorGroup;
  scaleMax: number;
  isHigh: boolean;
  isLow: boolean;
}) {
  const pct = Math.min(100, Math.max(4, (group.avg / scaleMax) * 100));
  const color = isHigh ? "var(--factor-high)" : isLow ? "var(--factor-low)" : "var(--muted)";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted w-28 shrink-0 truncate" title={group.label}>
        {group.label}
      </span>
      <div className="flex-1 h-2.5 rounded-full bg-background overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] font-medium w-24 text-right shrink-0">
        {group.avg}/{scaleMax} <span className="text-muted">({group.n}d)</span>
      </span>
    </div>
  );
}
