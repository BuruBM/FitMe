"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { Insight } from "@/lib/insights";

export function InsightsBanner({ insights }: { insights: Insight[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = insights.filter((i) => !dismissed.includes(i.id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((insight) => (
        <div
          key={insight.id}
          className={`card p-3.5 flex gap-2.5 items-start border-l-4 ${
            insight.tone === "notice" ? "border-l-accent" : "border-l-primary"
          }`}
        >
          <Sparkles size={16} className={insight.tone === "notice" ? "text-accent mt-0.5" : "text-primary mt-0.5"} />
          <p className="text-sm flex-1">{insight.text}</p>
          <button
            onClick={() => setDismissed((d) => [...d, insight.id])}
            className="text-muted text-lg leading-none px-1"
            aria-label="Descartar"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
