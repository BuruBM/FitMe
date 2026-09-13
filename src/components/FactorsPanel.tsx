"use client";

import { useState } from "react";
import { Compass, ChevronDown } from "lucide-react";
import type { FactorComparison, FactorDay } from "@/lib/factors";

const MOOD_MAX = 5;
const MAX_DAYS_SHOWN = 8;

export function FactorsPanel({ factors }: { factors: FactorComparison[] }) {
  if (factors.length === 0) {
    return (
      <section className="card p-4">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Compass size={16} className="text-primary" />
          Factores que afectan tu bienestar
        </div>
        <p className="text-xs text-muted mt-1">
          Todavía no hay suficientes días registrados para comparar. Con más check-ins de &quot;¿Cómo te sentís
          hoy?&quot; esto se va a ir llenando.
        </p>
      </section>
    );
  }

  return (
    <section className="card p-4">
      <div className="flex items-center gap-1.5 text-sm font-medium">
        <Compass size={16} className="text-primary" />
        Factores que afectan tu bienestar
      </div>
      <p className="text-[11px] text-muted mt-1 mb-3">
        Ánimo promedio (escala 1 a 5) según lo que pasaba ese día. Los días por grupo no tienen por qué coincidir
        entre categorías — cada uno cuenta lo que realmente pasó. Tocá una para ver los días.
      </p>
      <div className="space-y-3.5">
        {factors.map((f) => (
          <FactorRow key={f.id} factor={f} />
        ))}
      </div>
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
        <ChevronDown size={14} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
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
