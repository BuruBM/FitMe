import type { CyclePhase } from "@/lib/cycle";

export interface Insight {
  id: string;
  tone: "info" | "notice";
  text: string;
}

export interface InsightInputs {
  phase: CyclePhase | null;
  onBirthControl: boolean;
  daysSincePillStart: number | null; // null = unknown/not tracked
  pcos: boolean;
  isWeekend: boolean;
  avgProteinPct3d: number | null; // % of protein target hit, avg of last 3 logged days
  avgSleepHours3d: number | null;
  avgIrritability3d: number | null;
  avgSensitivity3d: number | null;
  avgSocialMediaMin3d: number | null;
  avgMood3d: number | null;
  daysSinceSocialContact: number | null; // null = no data at all yet
  todayCloudCoverPct: number | null;
  todayMood: number | null;
}

const PILL_ADJUSTMENT_WINDOW_DAYS = 90;

/**
 * Cross-references what's already logged into a handful of short, honest
 * observations — never more than two at once, so it reads as a gentle
 * heads-up rather than nagging. Purely rule-based on her own recent data,
 * nothing diagnostic or predictive beyond "here's what tends to go together".
 */
export function computeInsights(input: InsightInputs): Insight[] {
  const insights: Insight[] = [];

  if (
    !input.onBirthControl &&
    !input.isWeekend &&
    input.phase === "lútea" &&
    input.avgProteinPct3d != null &&
    input.avgProteinPct3d < 70 &&
    input.avgIrritability3d != null &&
    input.avgIrritability3d >= 3
  ) {
    insights.push({
      id: "luteal-low-protein",
      tone: "notice",
      text: `Estás en fase lútea${input.pcos ? " (con SOP suele notarse más)" : ""} y venís bajo tu objetivo de proteína los últimos días — combinado, es esperable más cansancio o irritabilidad. Priorizar proteína ahora puede ayudar más que de costumbre.`,
    });
  }

  if (input.avgSleepHours3d != null && input.avgSleepHours3d < 6) {
    insights.push({
      id: "low-sleep-streak",
      tone: "notice",
      text: `Dormiste ${input.avgSleepHours3d.toFixed(1)}h en promedio los últimos días. El ánimo y la energía suelen resentirse con poco sueño — si podés, priorizá descansar hoy.`,
    });
  }

  if (input.todayCloudCoverPct != null && input.todayCloudCoverPct >= 70 && input.todayMood != null && input.todayMood <= 2) {
    insights.push({
      id: "cloudy-low-mood",
      tone: "info",
      text: "Hoy está bien nublado y anotaste un ánimo bajo — podría estar relacionado. No necesariamente es algo tuyo.",
    });
  }

  const highIrritabilityOrSensitivity =
    (input.avgIrritability3d != null && input.avgIrritability3d >= 4) ||
    (input.avgSensitivity3d != null && input.avgSensitivity3d >= 4);

  if (!input.onBirthControl && (input.phase === "lútea" || input.phase === "menstrual") && highIrritabilityOrSensitivity) {
    insights.push({
      id: "phase-irritability",
      tone: "info",
      text: `Tu irritabilidad o sensibilidad vienen altas y coinciden con tu fase ${input.phase}. Es un patrón hormonal conocido, no falta de paciencia.`,
    });
  } else if (
    input.onBirthControl &&
    input.daysSincePillStart != null &&
    input.daysSincePillStart < PILL_ADJUSTMENT_WINDOW_DAYS &&
    highIrritabilityOrSensitivity
  ) {
    insights.push({
      id: "pill-adjustment-irritability",
      tone: "info",
      text: `Estás en las primeras semanas de la pastilla (el cuerpo suele tardar hasta unos 3 meses en acomodarse) y tu irritabilidad o sensibilidad vienen altas. Es esperable en este período de ajuste, no necesariamente algo que estés haciendo mal.`,
    });
  } else if (input.onBirthControl && highIrritabilityOrSensitivity) {
    insights.push({
      id: "pill-irritability-general",
      tone: "info",
      text: "Tu irritabilidad o sensibilidad vienen altas. Con anticonceptivos el patrón no sigue el ciclo espontáneo, pero las hormonas de la pastilla igual pueden influir en el ánimo — si se sostiene, vale la pena comentarlo con tu ginecóloga/o.",
    });
  }

  if (
    input.avgSocialMediaMin3d != null &&
    input.avgSocialMediaMin3d > 180 &&
    input.avgMood3d != null &&
    input.avgMood3d < 3
  ) {
    insights.push({
      id: "screen-time-mood",
      tone: "info",
      text: "Bastante tiempo en redes estos días junto con ánimo más bajo. No es causa segura, pero puede valer la pena un descanso de pantallas.",
    });
  }

  if (input.daysSinceSocialContact != null && input.daysSinceSocialContact >= 5) {
    insights.push({
      id: "low-social-contact",
      tone: "info",
      text: `Hace ${input.daysSinceSocialContact} días que no registrás contacto con gente querida. Un rato con alguien cercano suele ayudar al ánimo.`,
    });
  }

  return insights.slice(0, 2);
}
