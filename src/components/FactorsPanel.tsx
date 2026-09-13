import { Compass } from "lucide-react";
import type { FactorComparison } from "@/lib/factors";

const MOOD_MAX = 5;

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
      <p className="text-xs text-muted mt-1 mb-3">
        Comparamos tu ánimo promedio (1-5) según lo que pasaba ese día. Es un patrón de tus propios datos, no una
        causa comprobada.
      </p>
      <div className="space-y-3.5">
        {factors.map((f) => (
          <FactorRow key={f.id} factor={f} />
        ))}
      </div>
    </section>
  );
}

function FactorRow({ factor }: { factor: FactorComparison }) {
  const lower = factor.avgA <= factor.avgB ? factor : { ...factor, avgA: factor.avgB, avgB: factor.avgA, groupALabel: factor.groupBLabel, groupBLabel: factor.groupALabel, nA: factor.nB, nB: factor.nA };

  return (
    <div>
      <p className="text-xs font-semibold">{factor.label}</p>
      <div className="mt-1.5 space-y-1">
        <BarRow label={lower.groupALabel} value={lower.avgA} n={lower.nA} lower />
        <BarRow label={lower.groupBLabel} value={lower.avgB} n={lower.nB} lower={false} />
      </div>
      {factor.note && <p className="text-[11px] text-muted mt-1">{factor.note}</p>}
    </div>
  );
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
          style={{ width: `${pct}%`, background: lower ? "var(--danger)" : "var(--primary)" }}
        />
      </div>
      <span className="text-[11px] font-medium w-16 text-right shrink-0">
        {value.toFixed(1)} <span className="text-muted">(n={n})</span>
      </span>
    </div>
  );
}
