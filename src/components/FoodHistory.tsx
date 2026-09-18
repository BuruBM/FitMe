"use client";

import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import type { FoodLog } from "@/lib/database.types";

interface DayGroup {
  date: string;
  logs: FoodLog[];
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

function groupByDate(logs: FoodLog[]): DayGroup[] {
  const byDate = new Map<string, FoodLog[]>();
  for (const log of logs) {
    if (!byDate.has(log.log_date)) byDate.set(log.log_date, []);
    byDate.get(log.log_date)!.push(log);
  }
  return [...byDate.entries()]
    .map(([date, items]) => ({
      date,
      logs: items,
      calories: items.reduce((s, l) => s + l.calories, 0),
      proteinG: items.reduce((s, l) => s + l.protein_g, 0),
      carbsG: items.reduce((s, l) => s + l.carbs_g, 0),
      fatG: items.reduce((s, l) => s + l.fat_g, 0),
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function FoodHistory({ logs }: { logs: FoodLog[] }) {
  const [openDate, setOpenDate] = useState<string | null>(null);
  const days = groupByDate(logs);

  if (days.length === 0) {
    return (
      <section className="card p-4">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <UtensilsCrossed size={15} style={{ color: "var(--icon-food)" }} />
          Historial
        </div>
        <p className="text-sm text-muted mt-1">Los días anteriores van a aparecer acá.</p>
      </section>
    );
  }

  return (
    <section className="card p-4">
      <div className="flex items-center gap-1.5 text-sm font-semibold mb-2">
        <UtensilsCrossed size={15} style={{ color: "var(--icon-food)" }} />
        Historial
      </div>
      <div className="space-y-1">
        {days.map((day) => {
          const open = openDate === day.date;
          return (
            <div key={day.date} className="border-b border-card-border last:border-0">
              <button
                onClick={() => setOpenDate(open ? null : day.date)}
                className="w-full flex items-center justify-between py-2.5 text-left"
              >
                <span className="text-sm font-medium capitalize">
                  {new Date(day.date + "T00:00:00").toLocaleDateString("es-AR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <span className="text-xs text-muted">
                  {Math.round(day.calories)} kcal · P{Math.round(day.proteinG)}g C{Math.round(day.carbsG)}g G
                  {Math.round(day.fatG)}g
                </span>
              </button>
              {open && (
                <div className="pb-2.5 space-y-1.5">
                  {day.logs.map((log) => (
                    <div key={log.id} className="text-xs pl-1">
                      <div className="flex justify-between">
                        <span>{log.name}</span>
                        <span className="text-muted">
                          {log.quantity} {log.unit} · {Math.round(log.calories)} kcal · P{Math.round(log.protein_g)}g C
                          {Math.round(log.carbs_g)}g G{Math.round(log.fat_g)}g
                        </span>
                      </div>
                      {log.notes && <p className="italic text-muted mt-0.5">&quot;{log.notes}&quot;</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
