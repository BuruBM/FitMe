"use client";

import { useState } from "react";
import type { FoodLog } from "@/lib/database.types";

function groupByDate(logs: FoodLog[]): { date: string; logs: FoodLog[]; calories: number }[] {
  const byDate = new Map<string, FoodLog[]>();
  for (const log of logs) {
    if (!byDate.has(log.log_date)) byDate.set(log.log_date, []);
    byDate.get(log.log_date)!.push(log);
  }
  return [...byDate.entries()]
    .map(([date, items]) => ({ date, logs: items, calories: items.reduce((s, l) => s + l.calories, 0) }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function FoodHistory({ logs }: { logs: FoodLog[] }) {
  const [openDate, setOpenDate] = useState<string | null>(null);
  const days = groupByDate(logs);

  if (days.length === 0) {
    return (
      <section className="card p-4">
        <h2 className="font-semibold mb-1 text-sm">Historial</h2>
        <p className="text-sm text-muted">Los días anteriores van a aparecer acá.</p>
      </section>
    );
  }

  return (
    <section className="card p-4">
      <h2 className="font-semibold mb-2 text-sm">Historial</h2>
      <div className="space-y-1">
        {days.map((day) => {
          const open = openDate === day.date;
          return (
            <div key={day.date} className="border-b border-card-border last:border-0">
              <button
                onClick={() => setOpenDate(open ? null : day.date)}
                className="w-full flex items-center justify-between py-2.5 text-left"
              >
                <span className="text-sm font-medium">
                  {new Date(day.date + "T00:00:00").toLocaleDateString("es-AR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <span className="text-xs text-muted">{Math.round(day.calories)} kcal</span>
              </button>
              {open && (
                <div className="pb-2.5 space-y-1.5">
                  {day.logs.map((log) => (
                    <div key={log.id} className="flex justify-between text-xs pl-1">
                      <span>{log.name}</span>
                      <span className="text-muted">
                        {log.quantity} {log.unit} · {Math.round(log.calories)} kcal
                      </span>
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
