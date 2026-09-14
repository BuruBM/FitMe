// Hand-written types mirroring supabase/migrations/0001_init.sql.
// Regenerate with `supabase gen types typescript` once the project is linked, if you want
// the fully auto-generated version.

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";
export type Goal = "lose_weight" | "maintain" | "energy";
export type MealType = "desayuno" | "almuerzo" | "merienda" | "cena" | "snack";
export type FoodSource = "local_db" | "open_food_facts" | "manual" | "text_estimate" | "favorite";
export type Intensity = "bajo" | "medio" | "alto";

export interface Profile {
  id: string;
  full_name: string | null;
  sex: string;
  birth_date: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity_level: ActivityLevel;
  goal: Goal;
  wake_time: string;
  bloating_prone: boolean;
  osteopenia_risk: boolean;
  vegetarian: boolean;
  trip_date: string | null;
  vacation_since: string | null;
  vacation_until: string | null;
  calorie_target: number | null;
  protein_target_g: number | null;
  carb_target_g: number | null;
  fat_target_g: number | null;
  fiber_target_g: number | null;
  calcium_target_mg: number | null;
  sodium_limit_mg: number | null;
  water_target_ml: number;
  sleep_target_hours: number;
  avg_cycle_length: number;
  on_birth_control: boolean;
  pill_started_on: string | null;
  pcos: boolean;
  tracks_cycle: boolean;
  tracks_pets: boolean;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  pet_care_paused_until: string | null;
  onboarded: boolean;
  created_at: string;
}

export interface CustomFood {
  id: string;
  user_id: string;
  name: string;
  default_unit: string;
  default_quantity: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  calcium_mg: number;
  is_favorite: boolean;
  created_at: string;
}

export interface HiddenDefaultFood {
  user_id: string;
  food_id: string;
  created_at: string;
}

export interface FoodLog {
  id: string;
  user_id: string;
  logged_at: string;
  log_date: string;
  meal_type: MealType;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  calcium_mg: number;
  source: FoodSource;
  notes: string | null;
}

export interface WaterLog {
  id: string;
  user_id: string;
  logged_at: string;
  log_date: string;
  amount_ml: number;
}

export interface SleepLog {
  id: string;
  user_id: string;
  log_date: string;
  hours: number;
  quality: number | null;
  bedtime: string | null;
  wake_ups: number;
  notes: string | null;
}

export interface WeightLog {
  id: string;
  user_id: string;
  log_date: string;
  weight_kg: number;
}

export interface SymptomLog {
  id: string;
  user_id: string;
  log_date: string;
  bloating: number | null;
  energy: number | null;
  mood: number | null;
  irritability: number | null;
  sensitivity_level: number | null;
  alcohol_units: number;
  tobacco_used: boolean;
  cloud_cover_pct: number | null;
  weather_condition: string | null;
  social_media_minutes: number | null;
  social_contact: number | null;
  stress_level: number | null;
  notes_valence: number | null;
  notes: string | null;
}

export interface CycleLog {
  id: string;
  user_id: string;
  period_start_date: string;
  notes: string | null;
  created_at: string;
}

export interface PillLog {
  id: string;
  user_id: string;
  log_date: string;
  taken: boolean;
}

export interface BodyMeasurement {
  id: string;
  user_id: string;
  log_date: string;
  waist_cm: number | null;
  hip_cm: number | null;
  thigh_cm: number | null;
  arm_cm: number | null;
}

export interface PetCareLog {
  id: string;
  user_id: string;
  log_date: string;
  milo_medication: boolean;
  milo_supplement: boolean;
  zoe_medication: boolean;
  zoe_supplement: boolean;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  completed_at: string;
  log_date: string;
  workout_id: string;
  workout_name: string;
  duration_min: number | null;
  intensity: Intensity | null;
}

export interface GamificationState {
  user_id: string;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  badges: string[];
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> };
      custom_foods: { Row: CustomFood; Insert: Partial<CustomFood>; Update: Partial<CustomFood> };
      hidden_default_foods: {
        Row: HiddenDefaultFood;
        Insert: Partial<HiddenDefaultFood> & { user_id: string; food_id: string };
        Update: Partial<HiddenDefaultFood>;
      };
      food_logs: { Row: FoodLog; Insert: Partial<FoodLog>; Update: Partial<FoodLog> };
      water_logs: { Row: WaterLog; Insert: Partial<WaterLog>; Update: Partial<WaterLog> };
      sleep_logs: { Row: SleepLog; Insert: Partial<SleepLog>; Update: Partial<SleepLog> };
      weight_logs: { Row: WeightLog; Insert: Partial<WeightLog>; Update: Partial<WeightLog> };
      symptom_logs: { Row: SymptomLog; Insert: Partial<SymptomLog>; Update: Partial<SymptomLog> };
      workout_logs: { Row: WorkoutLog; Insert: Partial<WorkoutLog>; Update: Partial<WorkoutLog> };
      cycle_logs: { Row: CycleLog; Insert: Partial<CycleLog>; Update: Partial<CycleLog> };
      pill_logs: { Row: PillLog; Insert: Partial<PillLog>; Update: Partial<PillLog> };
      pet_care_logs: { Row: PetCareLog; Insert: Partial<PetCareLog>; Update: Partial<PetCareLog> };
      body_measurements: { Row: BodyMeasurement; Insert: Partial<BodyMeasurement>; Update: Partial<BodyMeasurement> };
      gamification_state: {
        Row: GamificationState;
        Insert: Partial<GamificationState> & { user_id: string };
        Update: Partial<GamificationState>;
      };
    };
  };
}
