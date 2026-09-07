"use client";

import { useTransition } from "react";
import { Droplet } from "lucide-react";
import { logWater } from "@/lib/actions/tracking";

export function WaterQuickAdd({ currentMl, targetMl }: { currentMl: number; targetMl: number }) {
  const [isPending, startTransition] = useTransition();
  const pct = targetMl > 0 ? Math.min(100, Math.round((currentMl / targetMl) * 100)) : 0;

  function add(ml: number) {
    startTransition(() => {
      logWater(ml);
    });
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-1.5 text-sm font-medium">
        <Droplet size={16} className="text-primary" />
        Agua
      </div>
      <p className="text-xs text-muted mt-1">
        {(currentMl / 1000).toFixed(1)}L / {(targetMl / 1000).toFixed(1)}L ({pct}%)
      </p>
      <div className="h-2 rounded-full bg-card-border overflow-hidden mt-2">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
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
