"use client";

import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, parseISO, getISOWeek } from "date-fns";
import { es } from "date-fns/locale";
import type { HistoryPoint } from "@/lib/queries";
import { DayDetailPanel } from "@/components/DayDetailPanel";

type Period = "semana" | "mes" | "trimestre" | "año";
type MetricKey = "wellness" | "weightKg" | "mood" | "irritability" | "sleepHours" | "calories";

const PERIOD_DAYS: Record<Period, number> = { semana: 7, mes: 30, trimestre: 90, año: 365 };
const PERIOD_LABELS: Record<Period, string> = { semana: "Semana", mes: "Mes", trimestre: "Trimestre", año: "Año" };

interface MetricDef {
  key: MetricKey;
  label: string;
  domain: [number | string, number | string];
  color: string;
  width: number;
  tickFormatter?: (v: number) => string;
  formatValue: (v: number) => string;
}

const METRICS: MetricDef[] = [
  { key: "wellness", label: "Bienestar", domain: [0, 100], color: "var(--primary)", width: 30, formatValue: (v) => `${Math.round(v)}/100` },
  { key: "weightKg", label: "Peso", domain: ["auto", "auto"], color: "var(--primary)", width: 38, formatValue: (v) => `${v}kg` },
  // 0, not 1: the scale itself never goes below 1, but starting the axis at
  // 1 pins the lowest real value to the baseline, making it look like "no
  // data" instead of "the lowest it can be".
  { key: "mood", label: "Ánimo", domain: [0, 5], color: "var(--primary)", width: 28, formatValue: (v) => `${v}/5` },
  { key: "irritability", label: "Irritabilidad", domain: [0, 5], color: "var(--danger)", width: 28, formatValue: (v) => `${v}/5` },
  { key: "sleepHours", label: "Sueño", domain: ["auto", "auto"], color: "var(--icon-sleep)", width: 32, formatValue: (v) => `${v}h` },
  // 0, not "auto": an auto-scaled lower bound exaggerates small day-to-day
  // differences into what looks like "barely ate anything".
  { key: "calories", label: "Calorías", domain: [0, "auto"], color: "var(--accent)", width: 42, formatValue: (v) => `${Math.round(v)} kcal` },
];

function metricValue(p: HistoryPoint, key: MetricKey): number | null {
  switch (key) {
    case "wellness":
      return p.wellness;
    case "weightKg":
      return p.weightKg;
    case "mood":
      return p.mood;
    case "irritability":
      return p.irritability;
    case "sleepHours":
      return p.sleepHours;
    case "calories":
      return p.calories > 0 ? p.calories : null;
  }
}

interface Bucket {
  label: string;
  date: string | null; // set only for daily (non-aggregated) buckets, so points are tappable
  value: number | null;
}

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: Bucket;
  onSelect: (date: string) => void;
  selectedDate: string | null;
  color: string;
}

// Recharts fires the chart's own onClick for any tap inside the plot area,
// snapping to the nearest x — on mobile that reads as "the whole chart is
// one giant button" and can select a different day than the one tapped.
// Making only the dots themselves clickable (with a generous invisible
// touch target) fixes both: taps elsewhere do nothing, and the day you get
// is the one you actually tapped.
function ClickableDot({ cx, cy, payload, onSelect, selectedDate, color }: DotProps) {
  if (cx == null || cy == null || !payload?.date || payload.value == null) return null;
  const isSelected = payload.date === selectedDate;
  return (
    <g onClick={() => onSelect(payload.date!)} tabIndex={-1} style={{ cursor: "pointer", outline: "none" }}>
      <circle cx={cx} cy={cy} r={14} fill="transparent" />
      <circle cx={cx} cy={cy} r={isSelected ? 6 : 4} fill={color} stroke="var(--card)" strokeWidth={isSelected ? 2 : 0} />
    </g>
  );
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function bucketize(points: HistoryPoint[], period: Period, metricKey: MetricKey): Bucket[] {
  if (period === "semana" || period === "mes") {
    return points.map((p) => ({ label: format(parseISO(p.date), "d/M"), date: p.date, value: metricValue(p, metricKey) }));
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
    const values = pts.map((p) => metricValue(p, metricKey)).filter((v): v is number => v != null);
    return { label, date: null, value: average(values) };
  });
}

export function ProgressCharts({ history }: { history: HistoryPoint[] }) {
  const [period, setPeriod] = useState<Period>("semana");
  const [metricKey, setMetricKey] = useState<MetricKey>("wellness");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showWellnessInfo, setShowWellnessInfo] = useState(false);

  const metric = METRICS.find((m) => m.key === metricKey)!;
  const isDaily = period === "semana" || period === "mes";

  const sliced = useMemo(() => history.slice(-PERIOD_DAYS[period]), [history, period]);
  const buckets = useMemo(() => bucketize(sliced, period, metricKey), [sliced, period, metricKey]);
  const hasData = buckets.some((b) => b.value != null);

  const selectedPoint = selectedDate ? sliced.find((p) => p.date === selectedDate) ?? null : null;

  function selectDate(date: string) {
    setSelectedDate(date === selectedDate ? null : date);
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
        <h2 className="font-semibold mb-2">Progreso</h2>
        <div className="chip-row-scroll flex gap-1.5 overflow-x-auto pb-2">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => {
                setMetricKey(m.key);
                setSelectedDate(null);
              }}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium border ${
                metricKey === m.key ? "bg-primary text-primary-foreground border-primary" : "border-card-border text-muted"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {metricKey === "wellness" && (
          <div className="mb-2">
            <p className="text-xs text-muted">
              Combina ánimo, energía, irritabilidad, estrés, contacto social, redes, la carita de tu nota, sueño,
              agua, calorías, proteína y movimiento.{" "}
              <button onClick={() => setShowWellnessInfo((v) => !v)} className="text-primary font-medium">
                {showWellnessInfo ? "Ocultar" : "¿Cómo se calcula?"}
              </button>
            </p>
            {showWellnessInfo && (
              <div className="mt-2 rounded-lg border border-card-border bg-background p-2.5 text-[11px] text-muted space-y-1">
                <p>Cada parte vale de 0 a 100, y el resultado es el promedio de las que tengas cargadas ese día (con al menos 2):</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Ánimo y energía: más alto tu número (1-5), más puntos.</li>
                  <li>Irritabilidad y estrés: más bajo tu número, más puntos (se invierten).</li>
                  <li>Contacto social: más alto tu número (0-5), más puntos.</li>
                  <li>Redes: menos minutos, más puntos.</li>
                  <li>Carita de la nota: 😄/🙂 suma puntos, 😣/🙁 resta, 😐 neutra no afecta nada.</li>
                  <li>Sueño y agua: % de tu objetivo alcanzado ese día (tope 100%).</li>
                  <li>Calorías: más puntos cuanto más cerca de tu objetivo — llegar o quedarte un poco por debajo también suma, alejarte mucho (de más o de menos) resta.</li>
                  <li>Proteína: solo resta si consumís menos que un mínimo saludable para tu peso — pasarte de tu objetivo no resta.</li>
                  <li>Movimiento: suma puntos extra según los minutos que hiciste (tope a los 30 min) — si no registraste nada, simplemente no cuenta (no resta).</li>
                </ul>
                <p>
                  Como es un promedio de lo que cargaste, un día con pocos datos no pesa igual que uno completo —
                  por eso el número es una referencia, y el detalle de cada día (tocando el gráfico) es lo que
                  cuenta la historia completa.
                </p>
              </div>
            )}
          </div>
        )}

        {hasData ? (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={buckets} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted)" padding={{ left: 12, right: 12 }} />
                <YAxis
                  domain={metric.domain}
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted)"
                  width={metric.width}
                  tickFormatter={metric.tickFormatter}
                />
                <Tooltip
                  cursor={false}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(v: unknown) => [metric.formatValue(Number(v)), metric.label]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={metric.label}
                  stroke={metric.color}
                  strokeWidth={2.5}
                  dot={
                    isDaily
                      ? (dotProps: unknown) => (
                          <ClickableDot
                            key={(dotProps as { key?: string }).key}
                            {...(dotProps as DotProps)}
                            onSelect={selectDate}
                            selectedDate={selectedDate}
                            color={metric.color}
                          />
                        )
                      : { r: 3 }
                  }
                  activeDot={isDaily ? false : { r: 6 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted">Todavía no hay suficientes registros en este período.</p>
        )}
        {selectedPoint && <DayDetailPanel point={selectedPoint} onClose={() => setSelectedDate(null)} />}
      </section>
    </div>
  );
}
