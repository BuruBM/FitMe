interface MacroDatum {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}

export function MacroTrio({ macros }: { macros: MacroDatum[] }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {macros.map((m) => {
        const pct = m.target > 0 ? Math.min(100, Math.round((m.value / m.target) * 100)) : 0;
        return (
          <div key={m.label} className="text-center">
            <p className="text-[11px] text-foreground/80 font-medium truncate">{m.label}</p>
            <p className="text-xs text-muted mt-0.5">
              {Math.round(m.value)}/{Math.round(m.target)}
              {m.unit}
            </p>
            <div className="h-1.5 rounded-full bg-card-border overflow-hidden mt-1.5">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: m.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
