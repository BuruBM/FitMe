"use client";

import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";

export function DayNav({ date, today }: { date: string; today: string }) {
  const router = useRouter();
  const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CalendarDays size={16} className="text-primary" />
          <span className="capitalize">{date === today ? "Hoy" : dateLabel}</span>
        </div>
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => e.target.value && router.push(`/day/${e.target.value}`)}
          className="rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
        />
      </div>
      <p className="text-xs text-muted mt-1">Elegí una fecha para cargar o editar datos de ese día.</p>
    </section>
  );
}
