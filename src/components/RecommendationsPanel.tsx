"use client";

import { useState } from "react";
import { TIPS, type Tip } from "@/data/tips";

const CATEGORIES: { value: Tip["category"]; label: string }[] = [
  { value: "proteína", label: "Proteína" },
  { value: "hinchazón", label: "Hinchazón" },
  { value: "huesos", label: "Huesos" },
  { value: "trabajo", label: "Trabajo" },
  { value: "social", label: "Social" },
  { value: "energía", label: "Energía" },
  { value: "sueño", label: "Sueño" },
  { value: "hormonas", label: "Hormonas" },
];

export function RecommendationsPanel() {
  const [category, setCategory] = useState<Tip["category"]>("hormonas");
  const tips = TIPS.filter((t) => t.category === category);

  return (
    <section className="card p-4">
      <h2 className="font-semibold mb-2">Recomendaciones para vos</h2>
      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border ${
              category === c.value ? "bg-primary text-primary-foreground border-primary" : "border-card-border text-muted"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="space-y-3 mt-2">
        {tips.map((t) => (
          <div key={t.id} className="border-b border-card-border pb-3 last:border-0 last:pb-0">
            <p className="text-sm font-medium">{t.title}</p>
            <p className="text-xs text-muted mt-0.5">{t.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
