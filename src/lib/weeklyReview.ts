export interface DayStat {
  date: string;
  isWeekend: boolean;
  proteinPct: number | null; // % of protein target
  sleepHours: number | null;
  waterPct: number | null; // % of water target
  mood: number | null;
  hasWorkout: boolean;
  hasAnyLog: boolean;
}

export interface WeeklyReviewInput {
  days: DayStat[]; // last 7 days, oldest first
  sleepTargetHours: number;
}

export interface WeeklyReview {
  daysLogged: number;
  avgProteinPct: number | null;
  weekdayProteinPct: number | null;
  weekendProteinPct: number | null;
  avgSleepHours: number | null;
  avgWaterPct: number | null;
  workoutsCount: number;
  moodTrend: "subiendo" | "bajando" | "estable" | null;
  recommendations: string[];
}

function avg(nums: (number | null)[]): number | null {
  const valid = nums.filter((n): n is number => n != null);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export function buildWeeklyReview(input: WeeklyReviewInput): WeeklyReview | null {
  const loggedDays = input.days.filter((d) => d.hasAnyLog);
  if (loggedDays.length < 4) return null;

  const weekdayDays = input.days.filter((d) => !d.isWeekend);
  const weekendDays = input.days.filter((d) => d.isWeekend);

  const avgProteinPct = avg(input.days.map((d) => d.proteinPct));
  const weekdayProteinPct = avg(weekdayDays.map((d) => d.proteinPct));
  const weekendProteinPct = avg(weekendDays.map((d) => d.proteinPct));
  const avgSleepHours = avg(input.days.map((d) => d.sleepHours));
  const avgWaterPct = avg(input.days.map((d) => d.waterPct));
  const workoutsCount = input.days.filter((d) => d.hasWorkout).length;

  const moods = input.days.map((d) => d.mood).filter((m): m is number => m != null);
  let moodTrend: WeeklyReview["moodTrend"] = null;
  if (moods.length >= 4) {
    const mid = Math.floor(moods.length / 2);
    const firstHalf = avg(moods.slice(0, mid)) ?? 0;
    const secondHalf = avg(moods.slice(mid)) ?? 0;
    const diff = secondHalf - firstHalf;
    moodTrend = diff > 0.4 ? "subiendo" : diff < -0.4 ? "bajando" : "estable";
  }

  const recommendations: string[] = [];

  if (
    weekdayProteinPct != null &&
    weekendProteinPct != null &&
    weekdayProteinPct < 75 &&
    weekendProteinPct - weekdayProteinPct > 15
  ) {
    recommendations.push(
      "Entre semana te costó más llegar a tu objetivo de proteína que el fin de semana. Para la próxima, dejá algo rápido armado para esos días (proteína en polvo, huevos duros, tofu ya cocido) en vez de improvisar a último momento.",
    );
  } else if (avgProteinPct != null && avgProteinPct < 70) {
    recommendations.push(
      "Esta semana viniste bastante por debajo de tu objetivo de proteína casi todos los días. Para la próxima, probá sumar una fuente de proteína extra en el desayuno — suele ser la comida más fácil de reforzar.",
    );
  }

  if (avgSleepHours != null && avgSleepHours < input.sleepTargetHours - 1) {
    recommendations.push(
      `Dormiste en promedio ${avgSleepHours.toFixed(1)}h esta semana, por debajo de tu meta de ${input.sleepTargetHours}h. Para la próxima, probá adelantar 15-20 minutos la hora de acostarte en vez de intentar dormir mucho más de golpe.`,
    );
  }

  if (workoutsCount === 0) {
    recommendations.push(
      "No hubo entrenamiento ni caminata registrada esta semana — sin culpa, pasa. Para la próxima, poné como objetivo mínimo una sola rutina de 10 minutos o una caminata corta: sostener la constancia importa más que la cantidad.",
    );
  } else if (workoutsCount >= 3) {
    recommendations.push(`Completaste ${workoutsCount} entrenamientos o caminatas esta semana — buen ritmo, mantenelo.`);
  }

  if (weekendDays.length > 0 && weekendProteinPct != null && weekdayProteinPct != null && weekendProteinPct < weekdayProteinPct) {
    recommendations.push(
      "El fin de semana bajó un poco tu consistencia respecto a la semana — es esperable y está bien, no hace falta compensarlo el lunes. Lo que importa es el promedio general, no cada día calcado.",
    );
  }

  if (moodTrend === "bajando") {
    recommendations.push(
      "Tu ánimo vino bajando a lo largo de la semana. Puede valer la pena revisar el historial de Progreso para ver si coincide con sueño, ciclo o algo puntual, y ajustar de a poco para la semana que viene.",
    );
  }

  return {
    daysLogged: loggedDays.length,
    avgProteinPct,
    weekdayProteinPct,
    weekendProteinPct,
    avgSleepHours,
    avgWaterPct,
    workoutsCount,
    moodTrend,
    recommendations: recommendations.slice(0, 3),
  };
}
