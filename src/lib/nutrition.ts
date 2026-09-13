import type { ActivityLevel, Goal, Profile } from "@/lib/database.types";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

export interface NutritionInputs {
  sex: string;
  birthDate: string | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: ActivityLevel;
  goal: Goal;
  osteopeniaRisk: boolean;
  bloatingProne: boolean;
}

export interface NutritionTargets {
  calorieTarget: number;
  proteinTargetG: number;
  carbTargetG: number;
  fatTargetG: number;
  fiberTargetG: number;
  calciumTargetMg: number;
  sodiumLimitMg: number;
  waterTargetMl: number;
  bmr: number;
  tdee: number;
  ageYears: number | null;
}

function ageFromBirthDate(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

/**
 * Mifflin-St Jeor, capped to a conservative deficit: aggressive deficits
 * accelerate bone density loss, which matters given osteopenia risk.
 */
export function calculateNutritionTargets(input: NutritionInputs): NutritionTargets {
  const age = ageFromBirthDate(input.birthDate) ?? 36;
  const weight = input.weightKg ?? 65;
  const height = input.heightCm ?? 165;
  const isFemale = input.sex !== "male";

  const bmr = isFemale
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5;

  const tdee = bmr * ACTIVITY_MULTIPLIERS[input.activityLevel];

  let calorieTarget = tdee;
  if (input.goal === "lose_weight") {
    // ~18% deficit, never below BMR + 150 kcal, to protect bone/muscle mass.
    calorieTarget = Math.max(tdee * 0.82, bmr + 150);
  } else if (input.goal === "energy") {
    calorieTarget = tdee; // maintenance, focus is on nutrient quality/timing, not deficit
  }
  calorieTarget = Math.round(calorieTarget / 10) * 10;

  // Protein-forward split: satiety while cutting + supports bone/muscle (osteopenia).
  // Kept moderate on purpose — a vegetarian diet built on soy/eggs/protein powder
  // makes a high target hard to hit day to day, and an unreachable number is worse
  // than a slightly lower one she can actually sustain. She can always raise it
  // manually in her profile if it's working for her.
  const proteinPerKg = input.osteopeniaRisk ? 1.4 : 1.2;
  const proteinTargetG = Math.round(weight * proteinPerKg);
  const fatTargetG = Math.round((calorieTarget * 0.28) / 9);
  const carbCalories = calorieTarget - proteinTargetG * 4 - fatTargetG * 9;
  const carbTargetG = Math.max(Math.round(carbCalories / 4), 80);

  const fiberTargetG = 28;
  // Women 19-50: 1000mg/day RDA; osteopenia risk nudges it toward the upper practical range.
  const calciumTargetMg = input.osteopeniaRisk ? 1200 : 1000;
  // Lower sodium ceiling helps with bloating/water retention.
  const sodiumLimitMg = input.bloatingProne ? 2000 : 2300;
  const waterTargetMl = Math.round((weight * 33) / 50) * 50;

  return {
    calorieTarget,
    proteinTargetG,
    carbTargetG,
    fatTargetG,
    fiberTargetG,
    calciumTargetMg,
    sodiumLimitMg,
    waterTargetMl,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    ageYears: ageFromBirthDate(input.birthDate),
  };
}

export function targetsFromProfile(profile: Profile): NutritionInputs {
  return {
    sex: profile.sex,
    birthDate: profile.birth_date,
    heightCm: profile.height_cm,
    weightKg: profile.weight_kg,
    activityLevel: profile.activity_level,
    goal: profile.goal,
    osteopeniaRisk: profile.osteopenia_risk,
    bloatingProne: profile.bloating_prone,
  };
}

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
