"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";
import type { HistoryPoint } from "@/lib/queries";

export function WeightChart({ history }: { history: HistoryPoint[] }) {
  const data = history
    .filter((p) => p.weightKg != null)
    .map((p) => ({ date: format(parseISO(p.date), "d/M"), peso: p.weightKg }));

  if (data.length < 2) {
    return (
      <section className="card p-4">
        <h2 className="font-semibold mb-1">Peso</h2>
        <p className="text-sm text-muted">Registrá tu peso algunos días para ver la tendencia acá.</p>
      </section>
    );
  }

  return (
    <section className="card p-4">
      <h2 className="font-semibold mb-2">Peso</h2>
      <div className="h-48 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted)" />
            <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} stroke="var(--muted)" width={40} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Line type="monotone" dataKey="peso" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
