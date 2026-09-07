export interface WorkoutExercise {
  name: string;
  detail: string; // reps/time
}

export interface Workout {
  id: string;
  title: string;
  durationMin: number;
  energyLevel: "bajo" | "medio" | "alto";
  focus: string;
  boneLoading: boolean; // weight-bearing/resistance, protective for osteopenia
  equipment: string;
  exercises: WorkoutExercise[];
}

export const WORKOUTS: Workout[] = [
  {
    id: "express-10-bajo",
    title: "Full body express",
    durationMin: 10,
    energyLevel: "bajo",
    focus: "Cuerpo completo, suave",
    boneLoading: true,
    equipment: "Sin equipamiento",
    exercises: [
      { name: "Sentadillas", detail: "2 series x 12" },
      { name: "Flexiones (rodillas si hace falta)", detail: "2 series x 8" },
      { name: "Plancha", detail: "3 x 20 seg" },
      { name: "Puente de glúteo", detail: "2 series x 15" },
    ],
  },
  {
    id: "fuerza-piernas-15",
    title: "Fuerza tren inferior",
    durationMin: 15,
    energyLevel: "medio",
    focus: "Piernas y glúteos (carga de peso, protege huesos)",
    boneLoading: true,
    equipment: "Silla para apoyo, opcional mochila con libros",
    exercises: [
      { name: "Sentadillas", detail: "3 series x 15" },
      { name: "Zancadas alternadas", detail: "3 series x 10 por pierna" },
      { name: "Elevación de talones (pantorrillas)", detail: "3 series x 20" },
      { name: "Puente de glúteo a una pierna", detail: "2 series x 10 por lado" },
      { name: "Sentadilla isométrica en pared", detail: "3 x 30 seg" },
    ],
  },
  {
    id: "core-postura-10",
    title: "Core y postura",
    durationMin: 10,
    energyLevel: "medio",
    focus: "Zona media, ayuda a la postura tras horas sentada",
    boneLoading: false,
    equipment: "Sin equipamiento",
    exercises: [
      { name: "Plancha", detail: "3 x 25 seg" },
      { name: "Plancha lateral", detail: "2 x 15 seg por lado" },
      { name: "Elevación de piernas", detail: "2 series x 12" },
      { name: "Superman", detail: "2 series x 12" },
    ],
  },
  {
    id: "movilidad-10-bajo",
    title: "Movilidad y elongación",
    durationMin: 10,
    energyLevel: "bajo",
    focus: "Días de poca energía o mucho cansancio",
    boneLoading: false,
    equipment: "Sin equipamiento",
    exercises: [
      { name: "Rotación de cuello y hombros", detail: "1 min" },
      { name: "Estiramiento de isquiotibiales", detail: "30 seg x lado" },
      { name: "Postura del gato-vaca", detail: "10 repeticiones" },
      { name: "Estiramiento de cadera (paloma)", detail: "30 seg x lado" },
      { name: "Respiración profunda", detail: "2 min" },
    ],
  },
  {
    id: "hiit-suave-15",
    title: "HIIT suave",
    durationMin: 15,
    energyLevel: "alto",
    focus: "Cardio + fuerza, cuando tenés más energía",
    boneLoading: true,
    equipment: "Sin equipamiento",
    exercises: [
      { name: "Jumping jacks", detail: "40 seg on / 20 seg off" },
      { name: "Sentadilla con salto (o sin salto)", detail: "40 seg on / 20 seg off" },
      { name: "Escaladores (mountain climbers)", detail: "40 seg on / 20 seg off" },
      { name: "Plancha con toque de hombro", detail: "40 seg on / 20 seg off" },
      { name: "Repetir circuito x2-3", detail: "" },
    ],
  },
  {
    id: "superior-mochila-15",
    title: "Tren superior con mochila",
    durationMin: 15,
    energyLevel: "medio",
    focus: "Brazos y espalda usando una mochila con libros como peso",
    boneLoading: true,
    equipment: "Mochila con libros o botellas de agua",
    exercises: [
      { name: "Remo inclinado con mochila", detail: "3 series x 12" },
      { name: "Press de hombros con mochila", detail: "3 series x 12" },
      { name: "Flexiones", detail: "3 series x 8-10" },
      { name: "Curl de bíceps con mochila", detail: "3 series x 12" },
    ],
  },
  {
    id: "yoga-relax-10",
    title: "Yoga suave para dormir mejor",
    durationMin: 10,
    energyLevel: "bajo",
    focus: "Relajación antes de dormir, ayuda al descanso",
    boneLoading: false,
    equipment: "Sin equipamiento",
    exercises: [
      { name: "Postura del niño", detail: "1 min" },
      { name: "Torsión suave acostada", detail: "30 seg x lado" },
      { name: "Piernas contra la pared", detail: "2-3 min" },
      { name: "Respiración 4-7-8", detail: "5 ciclos" },
    ],
  },
];

export function workoutsForEnergy(level: "bajo" | "medio" | "alto"): Workout[] {
  return WORKOUTS.filter((w) => w.energyLevel === level);
}
