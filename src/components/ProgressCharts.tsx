"use client";

import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, parseISO, getISOWeek } from "date-fns";
import { es } from "date-fns/locale";
import type { HistoryPoint } from "@/lib/queries";
import { DayDetailPanel } from "@/components/DayDetailPanel";

type Period = "semana" | "mes" | "trimestre" | "año";

const PERIOD_DAYS: Record<Period, number> = { semana: 7, mes: 30, trimestre: 90, año: 365 };
const PERIOD_LABELS: Record<Period, string> = { semana: "Semana", mes: "Mes", trimestre: "Trimestre", año: "Año" };

interface Bucket {
  label: string;
  date: string | null; // set only for daily (non-aggregated) buckets, so points are tappable
  weightKg: number | null;
  wellness: number | null;
}

function average(nums: (number | null)[]): number | null {
  const valid = nums.filter((n): n is number => n != null);
  if (valid.length === 0) return null;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10;
}

function bucketize(points: HistoryPoint[], period: Period): Bucket[] {
  if (period === "semana" || period === "mes") {
    return points.map((p) => ({
      label: format(parseISO(p.date), "d/M"),
      date: p.date,
      weightKg: p.weightKg,
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
      date: null,
      weightKg: average(pts.map((p) => p.weightKg)),
      wellness: average(pts.map((p) => p.wellness)),
    };
  });
}

export function ProgressCharts({ history }: { history: HistoryPoint[] }) {
  const [period, setPeriod] = useState<Period>("mes");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const sliced = useMemo(() => history.slice(-PERIOD_DAYS[period]), [history, period]);
  const buckets = useMemo(() => bucketize(sliced, period), [sliced, period]);
  const isDaily = period === "semana" || period === "mes";

  const hasWeight = buckets.some((b) => b.weightKg != null);
  const hasWellness = buckets.some((b) => b.wellness != null);

  const selectedPoint = selectedDate ? sliced.find((p) => p.date === selectedDate) ?? null : null;

  function handleChartClick(e: unknown) {
    if (!isDaily) return;
    const payload = (e as { activePayload?: { payload: Bucket }[] } | null)?.activePayload?.[0]?.payload;
    if (payload?.date) setSelectedDate(payload.date === selectedDate ? null : payload.date);
  }

  return (
    <div className="space-y-4">
      <div className="chip-row-scroll flex gap-1.5 overflow-x-auto pb-1">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => {
              setPeriod(p);
              setSelectedDate(null);
            }}
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
        <h2 className="font-semibold mb-1">Bienestar general</h2>
        <p className="text-xs text-muted mb-2">
          Combina ánimo, energía, irritabilidad, estrés, sueño, agua, proteína y si te moviste — es una referencia,
          no reemplaza a tu propia sensación.
          {isDaily && " Tocá un punto para ver el detalle completo de ese día."}
        </p>
        {hasWellness ? (
          <div className="h-44 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={buckets} onClick={handleChartClick} style={{ cursor: isDaily ? "pointer" : "default" }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted)" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--muted)" width={30} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line
                  type="monotone"
                  dataKey="wellness"
                  name="Bienestar (0-100)"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={{ r: 4, cursor: isDaily ? "pointer" : "default" }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Todavía no hay suficientes registros de &quot;¿Cómo te sentís hoy?&quot; en este período.
          </p>
        )}
        {selectedPoint && <DayDetailPanel point={selectedPoint} onClose={() => setSelectedDate(null)} />}
      </section>
    </div>
  );
}
