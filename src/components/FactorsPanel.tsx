"use client";

import { useMemo, useState } from "react";
import { Compass, ChevronDown } from "lucide-react";
import { computeFactors, type FactorComparison, type FactorDay } from "@/lib/factors";
import type { HistoryPoint } from "@/lib/queries";

const MOOD_MAX = 5;
const MAX_DAYS_SHOWN = 10;

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
          Factores que afectan tu bienestar
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
          No hay suficientes check-ins de &quot;¿Cómo te sentís hoy?&quot; en {period === "semana" ? "esta semana" : "este mes"} para comparar.
        </p>
      ) : (
        <>
          <p className="text-[11px] text-muted mt-1 mb-3">
            Ánimo promedio (escala 1 a 5) de {period === "semana" ? "los últimos 7 días" : "los últimos 30 días"},
            agrupado por lo que pasaba ese día. Tocá una categoría para ver los días.
          </p>
          <div className="space-y-3.5">
            {factors.map((f) => (
              <FactorRow key={f.id} factor={f} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function swapped(f: FactorComparison): FactorComparison {
  return {
    ...f,
    avgA: f.avgB,
    avgB: f.avgA,
    groupALabel: f.groupBLabel,
    groupBLabel: f.groupALabel,
    daysA: f.daysB,
    daysB: f.daysA,
  };
}

function FactorRow({ factor }: { factor: FactorComparison }) {
  const [open, setOpen] = useState(false);
  const lower = factor.avgA <= factor.avgB ? factor : swapped(factor);

  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between">
        <p className="text-xs font-semibold">{factor.label}</p>
        <span className="flex items-center gap-0.5 text-[10px] text-muted">
          {open ? "Ocultar días" : "Ver días"}
          <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      <div className="mt-1.5 space-y-1">
        <BarRow label={lower.groupALabel} value={lower.avgA} n={lower.daysA.length} lower />
        <BarRow label={lower.groupBLabel} value={lower.avgB} n={lower.daysB.length} lower={false} />
      </div>
      {factor.note && <p className="text-[11px] text-muted mt-1">{factor.note}</p>}
      {open && (
        <div className="mt-2 grid grid-cols-2 gap-3 border-t border-card-border pt-2">
          <DayList label={lower.groupALabel} days={lower.daysA} />
          <DayList label={lower.groupBLabel} days={lower.daysB} />
        </div>
      )}
    </div>
  );
}

function DayList({ label, days }: { label: string; days: FactorDay[] }) {
  const sorted = [...days].sort((a, b) => (a.date < b.date ? 1 : -1));
  const shown = sorted.slice(0, MAX_DAYS_SHOWN);
  return (
    <div>
      <p className="text-[11px] text-muted mb-1">{label}</p>
      <div className="space-y-0.5">
        {shown.map((d) => (
          <div key={d.date} className="flex justify-between text-[11px]">
            <span className="text-muted">{formatShortDate(d.date)}</span>
            <span className="font-medium">{d.value}/5</span>
          </div>
        ))}
        {sorted.length > shown.length && (
          <p className="text-[11px] text-muted">+{sorted.length - shown.length} más</p>
        )}
      </div>
    </div>
  );
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

function BarRow({ label, value, n, lower }: { label: string; value: number; n: number; lower: boolean }) {
  const pct = Math.min(100, Math.max(4, (value / MOOD_MAX) * 100));
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted w-32 shrink-0 truncate" title={label}>
        {label}
      </span>
      <div className="flex-1 h-2.5 rounded-full bg-card-border overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: lower ? "var(--factor-low)" : "var(--factor-high)" }}
        />
      </div>
      <span className="text-[11px] font-medium w-20 text-right shrink-0">
        {value.toFixed(1)}/5 <span className="text-muted">({n}d)</span>
      </span>
    </div>
  );
}
