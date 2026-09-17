"use client";

import { useState, useTransition } from "react";
import { Droplet } from "lucide-react";
import { logWater } from "@/lib/actions/tracking";
import { IconBadge } from "@/components/IconBadge";

export function WaterQuickAdd({
  currentMl,
  targetMl,
  date,
}: {
  currentMl: number;
  targetMl: number;
  date?: string;
}) {
  const [total, setTotal] = useState(currentMl);
  const [isPending, startTransition] = useTransition();
  const pct = targetMl > 0 ? Math.min(100, Math.round((total / targetMl) * 100)) : 0;

  function add(ml: number) {
    setTotal((t) => t + ml);
    startTransition(() => {
      logWater(ml, date);
    });
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <IconBadge icon={<Droplet size={14} />} tint="var(--tint-water)" color="var(--icon-water)" size={26} />
        Agua
      </div>
      <p className="text-xs text-muted mt-1">
        {(total / 1000).toFixed(1)}L / {(targetMl / 1000).toFixed(1)}L ({pct}%)
      </p>
      <div className="h-2 rounded-full bg-card-border overflow-hidden mt-2">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--icon-water)" }} />
      </div>
      <div className="flex gap-1.5 mt-3">
        {[250, 500].map((ml) => (
          <button
            key={ml}
            disabled={isPending}
            onClick={() => add(ml)}
            className="flex-1 rounded-lg border border-card-border text-xs py-1.5 font-medium hover:border-primary disabled:opacity-50"
          >
            +{ml}ml
          </button>
        ))}
      </div>
    </div>
  );
}
