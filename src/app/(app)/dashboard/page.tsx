import Link from "next/link";
import {
  getCurrentWeatherForUser,
  getCycleSummary,
  getProfile,
  getTodayPetCare,
  getTodaySummary,
} from "@/lib/queries";
import { daysUntil } from "@/lib/nutrition";
import { challengeOfTheWeek } from "@/data/challenges";
import { MacroBar } from "@/components/MacroBar";
import { WaterQuickAdd } from "@/components/WaterQuickAdd";
import { SleepQuickLog } from "@/components/SleepQuickLog";
import { BeachCountdown } from "@/components/BeachCountdown";
import { TipOfTheDay } from "@/components/TipOfTheDay";
import { CycleCard } from "@/components/CycleCard";
import { WeatherCard } from "@/components/WeatherCard";
import { PetCareQuickLog } from "@/components/PetCareQuickLog";

export default async function DashboardPage() {
  const [profile, summary, cycleSummary, weatherInfo, petCare] = await Promise.all([
    getProfile(),
    getTodaySummary(),
    getCycleSummary(),
    getCurrentWeatherForUser(),
    getTodayPetCare(),
  ]);

  if (!profile) return null;

  const calorieTarget = profile.calorie_target ?? 1800;
  const proteinTarget = profile.protein_target_g ?? 100;
  const carbTarget = profile.carb_target_g ?? 180;
  const fatTarget = profile.fat_target_g ?? 55;
  const sodiumLimit = profile.sodium_limit_mg ?? 2300;
  const calciumTarget = profile.calcium_target_mg ?? 1000;
  const waterTarget = profile.water_target_ml ?? 2000;

  const trip = daysUntil(profile.trip_date);
  const challenge = challengeOfTheWeek();

  return (
    <div className="space-y-4">
      {trip !== null && trip >= 0 && <BeachCountdown days={trip} />}

      <section className="card p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Hoy</h2>
          <span className="text-sm text-muted">
            {Math.round(summary.totalCalories)} / {calorieTarget} kcal
          </span>
        </div>
        <div className="mt-3 space-y-2.5">
          <MacroBar label="Proteína" value={summary.totalProtein} target={proteinTarget} unit="g" color="var(--primary)" />
          <MacroBar label="Carbohidratos" value={summary.totalCarbs} target={carbTarget} unit="g" color="var(--accent)" />
          <MacroBar label="Grasas" value={summary.totalFat} target={fatTarget} unit="g" color="#8a8d7f" />
        </div>
        <div className="mt-3 pt-3 border-t border-card-border grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted">Sodio</p>
            <p className={summary.totalSodium > sodiumLimit ? "text-danger font-medium" : "font-medium"}>
              {Math.round(summary.totalSodium)} / {sodiumLimit} mg
            </p>
          </div>
          <div>
            <p className="text-muted">Calcio (osteopenia)</p>
            <p className="font-medium">
              {Math.round(summary.totalCalcium)} / {calciumTarget} mg
            </p>
          </div>
        </div>
        <Link href="/food" className="mt-3 inline-block text-sm text-primary font-medium">
          + Registrar comida
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <WaterQuickAdd currentMl={summary.waterMl} targetMl={waterTarget} />
        <SleepQuickLog
          currentHours={summary.sleepHours}
          targetHours={profile.sleep_target_hours}
          currentBedtime={summary.sleepBedtime}
        />
      </section>

      <WeatherCard weather={weatherInfo.weather} city={weatherInfo.city} />

      {cycleSummary && <CycleCard summary={cycleSummary} pcos={profile.pcos} />}

      <PetCareQuickLog today={petCare} />

      <section className="card p-4">
        <p className="text-xs font-medium text-accent uppercase tracking-wide">Desafío de la semana</p>
        <h3 className="font-semibold mt-1">{challenge.title}</h3>
        <p className="text-sm text-muted mt-1">{challenge.description}</p>
      </section>

      <TipOfTheDay
        bloatingProne={profile.bloating_prone}
        osteopeniaRisk={profile.osteopenia_risk}
        pcos={profile.pcos}
      />
    </div>
  );
}
