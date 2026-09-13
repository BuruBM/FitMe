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
export function estimateCycle(lastPeriodStart: string | null, avgCycleLength: number): CycleEstimate | null {
  if (!lastPeriodStart) return null;

  const start = new Date(lastPeriodStart + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

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

export const PHASE_LABELS: Record<CyclePhase, string> = {
  menstrual: "Menstrual",
  folicular: "Folicular",
  ovulación: "Ovulación",
  lútea: "Lútea",
};
