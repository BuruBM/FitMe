import type { HistoryPoint } from "@/lib/queries";
import { PHASE_LABELS, type CyclePhase } from "@/lib/cycle";

export interface FactorDay {
  date: string;
  value: number;
}

export interface FactorComparison {
  id: string;
  label: string;
  groupALabel: string;
  groupBLabel: string;
  avgA: number;
  avgB: number;
  daysA: FactorDay[];
  daysB: FactorDay[];
  note?: string;
}

const MIN_DAYS_PER_GROUP = 3;
const MOOD_SCALE_MAX = 5;

function avg(days: FactorDay[]): number {
  return days.reduce((a, b) => a + b.value, 0) / days.length;
}

function splitBy(
  points: HistoryPoint[],
  predicate: (p: HistoryPoint) => boolean | null,
  metric: (p: HistoryPoint) => number | null,
): { a: FactorDay[]; b: FactorDay[] } {
  const a: FactorDay[] = [];
  const b: FactorDay[] = [];
  for (const p of points) {
    const cond = predicate(p);
    const value = metric(p);
    if (cond == null || value == null) continue;
    (cond ? a : b).push({ date: p.date, value });
  }
  return { a, b };
}

/**
 * Bucketed averages of mood by other logged variables — "does X actually
 * track with how you feel". Only rule-based comparison of her own numbers,
 * never a causal claim; each row is a description, not a diagnosis. Day
 * counts per group are whatever naturally occurred (e.g. more cloudy days
 * than clear ones some months) — they aren't meant to match across groups.
 * Returns the factors with the biggest observed gap first, capped so it
 * reads as a highlight reel rather than a wall of stats.
 */
export function computeFactors(points: HistoryPoint[], onBirthControl: boolean): FactorComparison[] {
  const results: FactorComparison[] = [];
  const moodOf = (p: HistoryPoint) => p.mood;

  const weather = splitBy(points, (p) => (p.cloudCoverPct != null ? p.cloudCoverPct >= 60 : null), moodOf);
  if (weather.a.length >= MIN_DAYS_PER_GROUP && weather.b.length >= MIN_DAYS_PER_GROUP) {
    results.push({
      id: "weather",
      label: "Clima",
      groupALabel: "Días nublados",
      groupBLabel: "Días despejados",
      avgA: avg(weather.a),
      avgB: avg(weather.b),
      daysA: weather.a,
      daysB: weather.b,
    });
  }

  const sleep = splitBy(points, (p) => (p.sleepHours != null ? p.sleepHours < 6.5 : null), moodOf);
  if (sleep.a.length >= MIN_DAYS_PER_GROUP && sleep.b.length >= MIN_DAYS_PER_GROUP) {
    results.push({
      id: "sleep",
      label: "Sueño",
      groupALabel: "Menos de 6.5h",
      groupBLabel: "6.5h o más",
      avgA: avg(sleep.a),
      avgB: avg(sleep.b),
      daysA: sleep.a,
      daysB: sleep.b,
    });
  }

  const movement = splitBy(points, (p) => p.movedToday, moodOf);
  if (movement.a.length >= MIN_DAYS_PER_GROUP && movement.b.length >= MIN_DAYS_PER_GROUP) {
    results.push({
      id: "movement",
      label: "Movimiento",
      groupALabel: "Días con entrenamiento o caminata",
      groupBLabel: "Días sin",
      avgA: avg(movement.a),
      avgB: avg(movement.b),
      daysA: movement.a,
      daysB: movement.b,
    });
  }

  const social = splitBy(points, (p) => (p.socialContact != null ? p.socialContact >= 2 : null), moodOf);
  if (social.a.length >= MIN_DAYS_PER_GROUP && social.b.length >= MIN_DAYS_PER_GROUP) {
    results.push({
      id: "social",
      label: "Contacto social",
      groupALabel: "Con contacto cercano",
      groupBLabel: "Con poco o nada",
      avgA: avg(social.a),
      avgB: avg(social.b),
      daysA: social.a,
      daysB: social.b,
    });
  }

  const screens = splitBy(points, (p) => (p.socialMediaMinutes != null ? p.socialMediaMinutes > 120 : null), moodOf);
  if (screens.a.length >= MIN_DAYS_PER_GROUP && screens.b.length >= MIN_DAYS_PER_GROUP) {
    results.push({
      id: "screens",
      label: "Redes sociales",
      groupALabel: "Más de 2h",
      groupBLabel: "2h o menos",
      avgA: avg(screens.a),
      avgB: avg(screens.b),
      daysA: screens.a,
      daysB: screens.b,
    });
  }

  const alcohol = splitBy(points, (p) => (p.alcoholUnits != null ? p.alcoholUnits > 0 : null), moodOf);
  if (alcohol.a.length >= MIN_DAYS_PER_GROUP && alcohol.b.length >= MIN_DAYS_PER_GROUP) {
    results.push({
      id: "alcohol",
      label: "Alcohol",
      groupALabel: "Con algún trago",
      groupBLabel: "Sin alcohol",
      avgA: avg(alcohol.a),
      avgB: avg(alcohol.b),
      daysA: alcohol.a,
      daysB: alcohol.b,
      note: "Es asociación, no causa: a veces se toma justo cuando el ánimo ya viene bajo.",
    });
  }

  if (onBirthControl) {
    const pill = splitBy(points, (p) => p.pillTaken, moodOf);
    if (pill.a.length >= MIN_DAYS_PER_GROUP && pill.b.length >= MIN_DAYS_PER_GROUP) {
      results.push({
        id: "pill",
        label: "Pastilla",
        groupALabel: "Días que la tomaste",
        groupBLabel: "Días que no",
        avgA: avg(pill.a),
        avgB: avg(pill.b),
        daysA: pill.a,
        daysB: pill.b,
      });
    }
  }

  if (!onBirthControl) {
    const byPhase = new Map<CyclePhase, FactorDay[]>();
    for (const p of points) {
      if (p.cyclePhase == null || p.mood == null) continue;
      if (!byPhase.has(p.cyclePhase)) byPhase.set(p.cyclePhase, []);
      byPhase.get(p.cyclePhase)!.push({ date: p.date, value: p.mood });
    }
    const phaseAverages = [...byPhase.entries()]
      .filter(([, days]) => days.length >= MIN_DAYS_PER_GROUP)
      .map(([phase, days]) => ({ phase, avgMood: avg(days), days }));

    if (phaseAverages.length >= 2) {
      phaseAverages.sort((a, b) => a.avgMood - b.avgMood);
      const lowest = phaseAverages[0];
      const highest = phaseAverages[phaseAverages.length - 1];
      if (highest.avgMood - lowest.avgMood >= 0.3) {
        results.push({
          id: "cycle",
          label: "Ciclo hormonal",
          groupALabel: `Fase ${PHASE_LABELS[lowest.phase]}`,
          groupBLabel: `Fase ${PHASE_LABELS[highest.phase]}`,
          avgA: lowest.avgMood,
          avgB: highest.avgMood,
          daysA: lowest.days,
          daysB: highest.days,
        });
      }
    }
  }

  return [...results].sort((a, b) => Math.abs(b.avgA - b.avgB) - Math.abs(a.avgA - a.avgB)).slice(0, 5);
}

export { MOOD_SCALE_MAX };
