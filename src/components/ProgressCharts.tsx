"use client";

import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { format, parseISO, getISOWeek } from "date-fns";
import { es } from "date-fns/locale";
import type { HistoryPoint } from "@/lib/queries";

type Period = "semana" | "mes" | "trimestre" | "año";

const PERIOD_DAYS: Record<Period, number> = { semana: 7, mes: 30, trimestre: 90, año: 365 };
const PERIOD_LABELS: Record<Period, string> = { semana: "Semana", mes: "Mes", trimestre: "Trimestre", año: "Año" };

interface Bucket {
  label: string;
  weightKg: number | null;
  mood: number | null;
  wellness: number | null;
}

function average(nums: (number | null)[]): number | null {
  const valid = nums.filter((n): n is number => n != null);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function bucketize(points: HistoryPoint[], period: Period): Bucket[] {
  if (period === "semana" || period === "mes") {
    return points.map((p) => ({
      label: format(parseISO(p.date), "d/M"),
      weightKg: p.weightKg,
      mood: p.mood,
      wellness: p.wellness,
    }));
  }

  const groups = new Map<string, HistoryPoint[]>();
  for (const p of points) {
    const d = parseISO(p.date);
    const key = period === "trimestre" ? `${d.getFullYear()}-W${getISOWeek(d)}` : format(d, "yyyy-MM");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  return [...groups.entries()].map(([, pts]) => {
    const firstDate = parseISO(pts[0].date);
    const label = period === "trimestre" ? format(firstDate, "d/M") : format(firstDate, "MMM", { locale: es });
    return {
      label,
      weightKg: average(pts.map((p) => p.weightKg)),
      mood: average(pts.map((p) => p.mood)),
      wellness: average(pts.map((p) => p.wellness)),
    };
  });
}

export function ProgressCharts({ history }: { history: HistoryPoint[] }) {
  const [period, setPeriod] = useState<Period>("mes");

  const sliced = useMemo(() => history.slice(-PERIOD_DAYS[period]), [history, period]);
  const buckets = useMemo(() => bucketize(sliced, period), [sliced, period]);

  const hasWeight = buckets.some((b) => b.weightKg != null);
  const hasMoodOrWellness = buckets.some((b) => b.mood != null || b.wellness != null);

  return (
    <div className="space-y-4">
      <div className="chip-row-scroll flex gap-1.5 overflow-x-auto pb-1">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border ${
              period === p ? "bg-primary text-primary-foreground border-primary" : "border-card-border text-muted"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      <section className="card p-4">
        <h2 className="font-semibold mb-1">Peso</h2>
        {hasWeight ? (
          <div className="h-44 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={buckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted)" />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} stroke="var(--muted)" width={38} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="weightKg" name="Peso (kg)" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted">Sin datos de peso en este período.</p>
        )}
      </section>

      <section className="card p-4">
        <h2 className="font-semibold mb-1">Ánimo y bienestar general</h2>
        <p className="text-xs text-muted mb-2">
          Ánimo es lo que registrás vos (1-5). Bienestar general combina ánimo, energía, irritabilidad, sueño, agua,
          proteína y movimiento del día — es una referencia, no reemplaza a tu propia sensación.
        </p>
        {hasMoodOrWellness ? (
          <div className="h-44 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={buckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted)" />
                <YAxis yAxisId="mood" domain={[1, 5]} tick={{ fontSize: 11 }} stroke="var(--muted)" width={26} />
                <YAxis yAxisId="wellness" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--muted)" width={30} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="mood" type="monotone" dataKey="mood" name="Ánimo (1-5)" stroke="var(--icon-cycle)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line yAxisId="wellness" type="monotone" dataKey="wellness" name="Bienestar (0-100)" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Todavía no hay suficientes registros de &quot;¿Cómo te sentís hoy?&quot; en este período.
          </p>
        )}
      </section>
    </div>
  );
}
