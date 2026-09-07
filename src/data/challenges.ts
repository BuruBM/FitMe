export interface Challenge {
  id: string;
  title: string;
  description: string;
}

// Rotates by ISO week number so it feels fresh without needing a backend job.
export const CHALLENGES: Challenge[] = [
  {
    id: "calcio-5",
    title: "Calcio en 5 comidas",
    description: "Sumá una fuente de calcio (tofu, lácteo, almendras, brócoli) en al menos 5 comidas esta semana.",
  },
  {
    id: "fuerza-3",
    title: "3 entrenamientos de fuerza",
    description: "Completá 3 rutinas de fuerza en casa esta semana (aunque sean de 10 minutos).",
  },
  {
    id: "receta-tofu",
    title: "Probá algo nuevo con tofu",
    description: "Cociná una receta que no hayas hecho antes con tofu o milanesa de soja.",
  },
  {
    id: "gusto-consciente",
    title: "Date un gusto, registralo",
    description: "Comé algo dulce o pedí delivery al menos una vez y anotalo sin culpa: forma parte del plan.",
  },
  {
    id: "agua-7",
    title: "Meta de agua 7 días",
    description: "Llegá a tu objetivo de agua los 7 días de la semana.",
  },
  {
    id: "social-balance",
    title: "Salida social equilibrada",
    description: "En tu próxima juntada, elegí primero la opción con proteína y alterná bebidas con agua.",
  },
  {
    id: "sueno-consistente",
    title: "Horario de dormir consistente",
    description: "Acostate a la misma hora al menos 5 noches esta semana.",
  },
  {
    id: "caminata-post-comida",
    title: "Caminatas post-comida",
    description: "Caminá 10 minutos después de almorzar o cenar, 4 veces esta semana.",
  },
];

function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function challengeOfTheWeek(date: Date = new Date()): Challenge {
  const week = isoWeekNumber(date);
  return CHALLENGES[week % CHALLENGES.length];
}
