import type { HistoryPoint } from "@/lib/queries";
import { PHASE_LABELS, type CyclePhase } from "@/lib/cycle";

export interface FactorGroup {
  label: string;
  avg: number;
  n: number;
}

export interface FactorComparison {
  id: string;
  label: string;
  groups: FactorGroup[];
}

function avg(nums: number[]): number {
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function median(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

// Splits by the ACTUAL median of her own logged values that period — not a
// fixed cutoff like ">2h of screens" — so it adapts to her real range.
// Shown as soon as there's at least one day on each side, no minimum-sample
// gate: a small n is visible (and honest) rather than hidden.
function medianSplit(
  points: HistoryPoint[],
  lowLabel: string,
  highLabel: string,
  factorOf: (p: HistoryPoint) => number | null,
): FactorGroup[] | null {
  const pairs = points
    .map((p) => ({ factor: factorOf(p), mood: p.mood }))
    .filter((x): x is { factor: number; mood: number } => x.factor != null && x.mood != null);
  if (pairs.length < 2) return null;

  const m = median(pairs.map((p) => p.factor));
  const low = pairs.filter((p) => p.factor <= m);
  const high = pairs.filter((p) => p.factor > m);
  if (low.length === 0 || high.length === 0) return null; // no real spread to compare

  return [
    { label: lowLabel, avg: avg(low.map((p) => p.mood)), n: low.length },
    { label: highLabel, avg: avg(high.map((p) => p.mood)), n: high.length },
  ];
}

const CYCLE_ORDER: CyclePhase[] = ["menstrual", "folicular", "ovulación", "lútea"];

function cycleGroups(points: HistoryPoint[]): FactorGroup[] | null {
  const byPhase = new Map<CyclePhase, number[]>();
  for (const p of points) {
    if (p.cyclePhase == null || p.mood == null) continue;
    if (!byPhase.has(p.cyclePhase)) byPhase.set(p.cyclePhase, []);
    byPhase.get(p.cyclePhase)!.push(p.mood);
  }
  if (byPhase.size < 2) return null;

  return CYCLE_ORDER.filter((phase) => byPhase.has(phase)).map((phase) => {
    const moods = byPhase.get(phase)!;
    return { label: PHASE_LABELS[phase], avg: avg(moods), n: moods.length };
  });
}

function gapOf(groups: FactorGroup[]): number {
  const values = groups.map((g) => g.avg);
  return Math.max(...values) - Math.min(...values);
}

/**
 * Cross-references her own logged ánimo against everything else she tracks,
 * for the days within the given window. Every comparison shown is real: no
 * factor is hidden for having "too few" days, and quantities (minutes,
 * grams, % nubosidad) are split by their own median instead of forced into
 * an arbitrary yes/no. Sorted so the biggest observed gap reads first.
 */
export function computeFactors(points: HistoryPoint[]): FactorComparison[] {
  const results: FactorComparison[] = [];

  const add = (id: string, label: string, groups: FactorGroup[] | null) => {
    if (groups) results.push({ id, label, groups });
  };

  add("sleep", "Sueño", medianSplit(points, "Menos horas", "Más horas", (p) => p.sleepHours));
  add(
    "movement",
    "Movimiento",
    medianSplit(points, "Menos minutos", "Más minutos", (p) => (p.movementMinutes > 0 ? p.movementMinutes : null)),
  );
  add(
    "social",
    "Contacto social",
    medianSplit(points, "Menos contacto", "Más contacto", (p) => p.socialContact),
  );
  add(
    "screens",
    "Redes sociales",
    medianSplit(points, "Menos tiempo", "Más tiempo", (p) => p.socialMediaMinutes),
  );
  add(
    "protein",
    "Proteína",
    medianSplit(points, "Menos proteína", "Más proteína", (p) => (p.proteinG > 0 ? p.proteinG : null)),
  );
  add(
    "weather",
    "Clima",
    medianSplit(points, "Más despejado", "Más nublado", (p) => p.cloudCoverPct),
  );
  add(
    "alcohol",
    "Alcohol",
    medianSplit(points, "Menos", "Más", (p) => p.alcoholUnits),
  );
  add("cycle", "Ciclo hormonal", cycleGroups(points));

  return results.sort((a, b) => gapOf(b.groups) - gapOf(a.groups)).slice(0, 8);
}
