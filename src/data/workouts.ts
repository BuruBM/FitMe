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
  usesEquipment: boolean; // needs dumbbells/ankle weights/jump rope/TRX, not just bodyweight
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
    usesEquipment: false,
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
    usesEquipment: false,
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
    usesEquipment: false,
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
    usesEquipment: false,
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
    usesEquipment: false,
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
    usesEquipment: true,
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
    usesEquipment: false,
    exercises: [
      { name: "Postura del niño", detail: "1 min" },
      { name: "Torsión suave acostada", detail: "30 seg x lado" },
      { name: "Piernas contra la pared", detail: "2-3 min" },
      { name: "Respiración 4-7-8", detail: "5 ciclos" },
    ],
  },
  {
    id: "mancuernas-brazos-15",
    title: "Brazos y hombros con mancuernas",
    durationMin: 15,
    energyLevel: "medio",
    focus: "Tren superior con tus mancuernas de 2kg",
    boneLoading: true,
    equipment: "2 mancuernas de 2kg",
    usesEquipment: true,
    exercises: [
      { name: "Curl de bíceps", detail: "3 series x 12" },
      { name: "Press de hombros", detail: "3 series x 12" },
      { name: "Remo a un brazo (apoyada en silla)", detail: "3 series x 10 por lado" },
      { name: "Extensión de tríceps por detrás de la cabeza", detail: "3 series x 12" },
      { name: "Elevaciones laterales", detail: "3 series x 12" },
    ],
  },
  {
    id: "tobilleras-gluteos-15",
    title: "Glúteos y piernas con tobilleras",
    durationMin: 15,
    energyLevel: "medio",
    focus: "Fuerza de cadera con tus tobilleras de 2kg (carga extra, protege huesos)",
    boneLoading: true,
    equipment: "2 tobilleras de 2kg",
    usesEquipment: true,
    exercises: [
      { name: "Patada de glúteo en cuadrupedia", detail: "3 series x 15 por lado" },
      { name: "Abducción de cadera de pie", detail: "3 series x 15 por lado" },
      { name: "Elevación de pierna en cuadrupedia (recta)", detail: "3 series x 15 por lado" },
      { name: "Puente de glúteo con tobilleras", detail: "3 series x 15" },
    ],
  },
  {
    id: "soga-cardio-10",
    title: "Cardio con soga de saltar",
    durationMin: 10,
    energyLevel: "alto",
    focus: "Cardio corto e intenso",
    boneLoading: true,
    equipment: "Soga de saltar",
    usesEquipment: true,
    exercises: [
      { name: "Salto continuo", detail: "1 min" },
      { name: "Descanso", detail: "30 seg" },
      { name: "Repetir el bloque", detail: "8 veces" },
    ],
  },
  {
    id: "trx-fullbody-20",
    title: "Circuito TRX cuerpo completo",
    durationMin: 20,
    energyLevel: "alto",
    focus: "Fuerza general usando las bandas TRX",
    boneLoading: true,
    equipment: "Bandas TRX",
    usesEquipment: true,
    exercises: [
      { name: "TRX remo (row)", detail: "3 series x 12" },
      { name: "TRX sentadilla", detail: "3 series x 15" },
      { name: "TRX press de pecho", detail: "3 series x 12" },
      { name: "TRX plancha con apoyo de pies", detail: "3 x 30 seg" },
      { name: "TRX zancada reversa", detail: "3 series x 10 por lado" },
    ],
  },
  {
    id: "circuito-completo-equipo-20",
    title: "Full body con todo tu equipo",
    durationMin: 20,
    energyLevel: "alto",
    focus: "Combina mancuernas, tobilleras y soga cuando tengas más ganas",
    boneLoading: true,
    equipment: "Mancuernas + tobilleras + soga",
    usesEquipment: true,
    exercises: [
      { name: "Salto de soga", detail: "1 min" },
      { name: "Sentadilla con mancuernas", detail: "3 series x 15" },
      { name: "Puente de glúteo con tobilleras", detail: "3 series x 15" },
      { name: "Remo con mancuernas", detail: "3 series x 12" },
      { name: "Plancha", detail: "3 x 30 seg" },
    ],
  },
];

export function workoutsForEnergy(level: "bajo" | "medio" | "alto"): Workout[] {
  return WORKOUTS.filter((w) => w.energyLevel === level);
}
