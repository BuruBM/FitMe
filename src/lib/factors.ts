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
//
// The "better" scenario (per betterIsHigh) is always returned first, so
// every card reads the same way regardless of what her data happens to
// show — e.g. "Más proteína" is always on top, whether or not it actually
// came with a higher average that period.
function medianSplit(
  points: HistoryPoint[],
  anchorOf: (p: HistoryPoint) => number | null,
  factorOf: (p: HistoryPoint) => number | null,
  betterLabel: string,
  worseLabel: string,
  betterIsHigh: boolean,
): FactorGroup[] | null {
  const pairs = points
    .map((p) => ({ factor: factorOf(p), anchor: anchorOf(p) }))
    .filter((x): x is { factor: number; anchor: number } => x.factor != null && x.anchor != null);
  if (pairs.length < 2) return null;

  const m = median(pairs.map((p) => p.factor));
  const low = pairs.filter((p) => p.factor <= m);
  const high = pairs.filter((p) => p.factor > m);
  if (low.length === 0 || high.length === 0) return null; // no real spread to compare

  const betterGroup = betterIsHigh ? high : low;
  const worseGroup = betterIsHigh ? low : high;
  return [
    { label: betterLabel, avg: avg(betterGroup.map((p) => p.anchor)), n: betterGroup.length },
    { label: worseLabel, avg: avg(worseGroup.map((p) => p.anchor)), n: worseGroup.length },
  ];
}

const CYCLE_ORDER: CyclePhase[] = ["menstrual", "folicular", "ovulación", "lútea"];

function cycleGroups(points: HistoryPoint[], anchorOf: (p: HistoryPoint) => number | null): FactorGroup[] | null {
  const byPhase = new Map<CyclePhase, number[]>();
  for (const p of points) {
    const a = anchorOf(p);
    if (p.cyclePhase == null || a == null) continue;
    if (!byPhase.has(p.cyclePhase)) byPhase.set(p.cyclePhase, []);
    byPhase.get(p.cyclePhase)!.push(a);
  }
  if (byPhase.size < 2) return null;

  return CYCLE_ORDER.filter((phase) => byPhase.has(phase)).map((phase) => {
    const vals = byPhase.get(phase)!;
    return { label: PHASE_LABELS[phase], avg: avg(vals), n: vals.length };
  });
}

function gapOf(groups: FactorGroup[]): number {
  const values = groups.map((g) => g.avg);
  return Math.max(...values) - Math.min(...values);
}

function sortByGap(results: FactorComparison[]): FactorComparison[] {
  return results.sort((a, b) => gapOf(b.groups) - gapOf(a.groups)).slice(0, 8);
}

/**
 * Cross-references her logged ánimo against everything else she tracks, for
 * the days within the given window. Every comparison shown is real: no
 * factor hidden for "too few" days, quantities split by their own median
 * instead of an arbitrary yes/no, and the healthier scenario always listed
 * first (more sleep, more proteína, more movimiento, more despejado, less
 * alcohol, less redes, more contacto) regardless of what the data shows.
 */
export function computeMoodFactors(points: HistoryPoint[]): FactorComparison[] {
  const anchorOf = (p: HistoryPoint) => p.mood;
  const results: FactorComparison[] = [];
  const add = (id: string, label: string, groups: FactorGroup[] | null) => {
    if (groups) results.push({ id, label, groups });
  };

  add("sleep", "Sueño", medianSplit(points, anchorOf, (p) => p.sleepHours, "Más horas", "Menos horas", true));
  add(
    "movement",
    "Movimiento",
    medianSplit(points, anchorOf, (p) => (p.movementMinutes > 0 ? p.movementMinutes : null), "Más minutos", "Menos minutos", true),
  );
  add(
    "social",
    "Contacto social",
    medianSplit(points, anchorOf, (p) => p.socialContact, "Más contacto", "Menos contacto", true),
  );
  add(
    "screens",
    "Redes sociales",
    medianSplit(points, anchorOf, (p) => p.socialMediaMinutes, "Menos tiempo", "Más tiempo", false),
  );
  add(
    "protein",
    "Proteína",
    medianSplit(points, anchorOf, (p) => (p.proteinG > 0 ? p.proteinG : null), "Más proteína", "Menos proteína", true),
  );
  add("weather", "Clima", medianSplit(points, anchorOf, (p) => p.cloudCoverPct, "Más despejado", "Más nublado", false));
  add("alcohol", "Alcohol", medianSplit(points, anchorOf, (p) => p.alcoholUnits, "Menos", "Más", false));
  add("cycle", "Ciclo hormonal", cycleGroups(points, anchorOf));

  return sortByGap(results);
}

/**
 * Same mechanism, anchored on hinchazón (0-3) instead of ánimo: comida,
 * movimiento, alcohol y ciclo, para ver qué se asocia con más o menos
 * hinchazón ese período.
 */
export function computeBloatingFactors(points: HistoryPoint[]): FactorComparison[] {
  const anchorOf = (p: HistoryPoint) => p.bloating;
  const results: FactorComparison[] = [];
  const add = (id: string, label: string, groups: FactorGroup[] | null) => {
    if (groups) results.push({ id, label, groups });
  };

  add(
    "calories",
    "Calorías",
    medianSplit(points, anchorOf, (p) => (p.calories > 0 ? p.calories : null), "Menos calorías", "Más calorías", false),
  );
  add(
    "protein",
    "Proteína",
    medianSplit(points, anchorOf, (p) => (p.proteinG > 0 ? p.proteinG : null), "Más proteína", "Menos proteína", true),
  );
  add(
    "movement",
    "Movimiento",
    medianSplit(points, anchorOf, (p) => (p.movementMinutes > 0 ? p.movementMinutes : null), "Más movimiento", "Menos movimiento", true),
  );
  add("alcohol", "Alcohol", medianSplit(points, anchorOf, (p) => p.alcoholUnits, "Menos", "Más", false));
  add("cycle", "Ciclo hormonal", cycleGroups(points, anchorOf));

  return sortByGap(results);
}
