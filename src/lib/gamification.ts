import type { GamificationState } from "@/lib/database.types";

export const XP_RULES = {
  food_log: 5,
  water_goal_hit: 10,
  sleep_log: 5,
  weight_log: 5,
  workout_done: 20,
  symptom_log: 5,
  pet_care_item: 3,
} as const;

// A full, well-logged day (check-in, meals, water goal, sleep, pet care,
// maybe a workout) earns roughly 50-100 XP — at 100 XP/level that meant a
// level-up most days, which reads as "one day = one level", not a real
// milestone. 500 XP/level makes a level take roughly a week of consistent
// use instead, leaving day-to-day consistency to the streak, not the level.
const XP_PER_LEVEL = 500;

export function xpForLevel(level: number): number {
  return (level - 1) * XP_PER_LEVEL;
}

export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpProgressInLevel(xp: number): { current: number; needed: number; pct: number } {
  const current = xp % XP_PER_LEVEL;
  return { current, needed: XP_PER_LEVEL, pct: Math.round((current / XP_PER_LEVEL) * 100) };
}

/**
 * Given the date of the last activity and today, returns the new streak count.
 * Same day -> streak unchanged. Yesterday -> streak +1. Older -> streak resets to 1.
 */
export function computeStreak(lastActivityDate: string | null, todayStr: string, currentStreak: number): number {
  if (!lastActivityDate) return 1;
  if (lastActivityDate === todayStr) return currentStreak || 1;

  const last = new Date(lastActivityDate + "T00:00:00");
  const today = new Date(todayStr + "T00:00:00");
  const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return currentStreak + 1;
  return 1;
}

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (ctx: BadgeContext) => boolean;
}

export interface BadgeContext {
  state: GamificationState;
  totalFoodLogs: number;
  totalWorkouts: number;
  totalWaterGoalDays: number;
  totalSleepLogs: number;
  daysWithFullLog: number;
  totalPetCareDaysComplete: number;
}

export const BADGES: BadgeDef[] = [
  {
    id: "first_log",
    title: "Primer paso",
    description: "Registraste tu primera comida.",
    icon: "🌱",
    check: (c) => c.totalFoodLogs >= 1,
  },
  {
    id: "streak_3",
    title: "Constancia x3",
    description: "3 días seguidos usando La Marea.",
    icon: "🔥",
    check: (c) => c.state.current_streak >= 3 || c.state.longest_streak >= 3,
  },
  {
    id: "streak_7",
    title: "Semana completa",
    description: "7 días seguidos de racha.",
    icon: "🏆",
    check: (c) => c.state.longest_streak >= 7,
  },
  {
    id: "streak_30",
    title: "Hábito instalado",
    description: "30 días seguidos de racha.",
    icon: "💎",
    check: (c) => c.state.longest_streak >= 30,
  },
  {
    id: "first_workout",
    title: "En movimiento",
    description: "Completaste tu primer entrenamiento en casa.",
    icon: "🏠",
    check: (c) => c.totalWorkouts >= 1,
  },
  {
    id: "workouts_10",
    title: "Fuerza en casa",
    description: "10 entrenamientos completados sin salir de casa.",
    icon: "💪",
    check: (c) => c.totalWorkouts >= 10,
  },
  {
    id: "hydration_7",
    title: "Bien hidratada",
    description: "Cumpliste tu meta de agua 7 días.",
    icon: "💧",
    check: (c) => c.totalWaterGoalDays >= 7,
  },
  {
    id: "sleep_7",
    title: "Descanso registrado",
    description: "Registraste tu sueño 7 veces.",
    icon: "🌙",
    check: (c) => c.totalSleepLogs >= 7,
  },
  {
    id: "full_day_5",
    title: "Día completo x5",
    description: "5 días registrando comida, agua y sueño juntos.",
    icon: "⭐",
    check: (c) => c.daysWithFullLog >= 5,
  },
  {
    id: "level_5",
    title: "Nivel 5",
    description: "Llegaste al nivel 5 en La Marea.",
    icon: "🚀",
    check: (c) => c.state.level >= 5,
  },
  {
    id: "cat_care_10",
    title: "Buena mamá de gatos",
    description: "10 días cuidando por completo a Milo y Zoe.",
    icon: "🐱",
    check: (c) => c.totalPetCareDaysComplete >= 10,
  },
];

export function evaluateNewBadges(ctx: BadgeContext): string[] {
  const earned = new Set(ctx.state.badges);
  const newlyEarned: string[] = [];
  for (const badge of BADGES) {
    if (!earned.has(badge.id) && badge.check(ctx)) {
      newlyEarned.push(badge.id);
    }
  }
  return newlyEarned;
}
