export type CyclePhase = "menstrual" | "folicular" | "ovulación" | "lútea";

export interface CycleEstimate {
  cycleDay: number;
  phase: CyclePhase;
}

/**
 * Rough, non-clinical estimate from the last logged period start date and an
 * average cycle length. With PCOS cycles are often irregular, so this is only
 * ever shown with a caveat — it's a pattern-spotting aid, not a prediction.
 */
export function estimateCycle(
  lastPeriodStart: string | null,
  avgCycleLength: number,
  referenceDate: Date = new Date(),
): CycleEstimate | null {
  if (!lastPeriodStart) return null;

  const start = new Date(lastPeriodStart + "T00:00:00");
  const now = new Date(referenceDate);
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return null;

  const cycleLength = avgCycleLength > 0 ? avgCycleLength : 28;
  const cycleDay = (diffDays % cycleLength) + 1;

  const ovulationDay = Math.round(cycleLength / 2) - 1;
  let phase: CyclePhase;
  if (cycleDay <= 5) {
    phase = "menstrual";
  } else if (cycleDay < ovulationDay) {
    phase = "folicular";
  } else if (cycleDay <= ovulationDay + 2) {
    phase = "ovulación";
  } else {
    phase = "lútea";
  }

  return { cycleDay, phase };
}

/**
 * Same estimate, but anchored to an arbitrary historical date instead of
 * today — used to reconstruct "what phase was she probably in on day X" for
 * charts and correlations. Picks whichever logged period start was the most
 * recent one on or before that date.
 */
export function estimateCycleForDate(
  dateStr: string,
  periodStarts: string[],
  avgCycleLength: number,
): CycleEstimate | null {
  const applicable = periodStarts.filter((p) => p <= dateStr).sort().at(-1) ?? null;
  if (!applicable) return null;
  return estimateCycle(applicable, avgCycleLength, new Date(dateStr + "T00:00:00"));
}

/** Days from today until the next period is expected to start, given the pattern so far. */
export function daysUntilNextPeriod(lastPeriodStart: string | null, avgCycleLength: number): number | null {
  const estimate = estimateCycle(lastPeriodStart, avgCycleLength);
  if (!estimate) return null;
  const cycleLength = avgCycleLength > 0 ? avgCycleLength : 28;
  return cycleLength - (estimate.cycleDay - 1);
}

export const PHASE_LABELS: Record<CyclePhase, string> = {
  menstrual: "Menstrual",
  folicular: "Folicular",
  ovulación: "Ovulación",
  lútea: "Lútea",
};

// Plain-language, non-diagnostic notes on what each phase commonly brings —
// shown so a low-energy or irritable day has context instead of feeling
// random. Real hormone swings, kept general on purpose.
export const PHASE_MOOD_INFO: Record<CyclePhase, string> = {
  menstrual: "Es común más cansancio y necesitar más descanso; el ánimo puede estar más sensible.",
  folicular: "El estrógeno empieza a subir: suele venir con más energía y mejor ánimo. Buen momento para lo que exige más esfuerzo.",
  ovulación: "Pico de energía, ánimo y ganas de socializar para muchas personas.",
  lútea: "Progesterona alta y en baja al final: es la fase donde el síndrome premenstrual es más común — irritabilidad, ansiedad, antojos y cansancio, más aún con SOP.",
};
