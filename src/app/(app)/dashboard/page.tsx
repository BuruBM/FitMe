import Link from "next/link";
import { Suspense } from "react";
import { Cloud } from "lucide-react";
import {
  getCurrentWeatherForUser,
  getCycleSummary,
  getDashboardInsights,
  getProfile,
  getTodayPetCare,
  getTodaySummary,
} from "@/lib/queries";
import { daysUntil } from "@/lib/nutrition";
import { challengeOfTheWeek } from "@/data/challenges";
import { MacroTrio } from "@/components/MacroTrio";
import { WaterQuickAdd } from "@/components/WaterQuickAdd";
import { SleepQuickLog } from "@/components/SleepQuickLog";
import { BeachCountdown } from "@/components/BeachCountdown";
import { TipOfTheDay } from "@/components/TipOfTheDay";
import { CycleCard } from "@/components/CycleCard";
import { WeatherCard } from "@/components/WeatherCard";
import { PetCareQuickLog } from "@/components/PetCareQuickLog";
import { InsightsBanner } from "@/components/InsightsBanner";
import { IconBadge } from "@/components/IconBadge";

// Weather is an external API call (Open-Meteo) that can be slow on a cold
// cache — split into its own Suspense boundary so it doesn't hold up
// everything else on the page from rendering.
async function WeatherSection() {
  const { weather, city } = await getCurrentWeatherForUser();
  return <WeatherCard weather={weather} city={city} />;
}

function WeatherSkeleton() {
  return (
    <section className="card p-4 animate-pulse">
      <div className="flex items-center gap-2 text-sm font-medium">
        <IconBadge icon={<Cloud size={14} />} tint="var(--tint-weather)" color="var(--icon-weather)" size={26} />
        <span className="h-3 w-20 rounded bg-card-border/40" />
      </div>
    </section>
  );
}

export default async function DashboardPage() {
  const [profile, summary, cycleSummary, petCare, insights] = await Promise.all([
    getProfile(),
    getTodaySummary(),
    getCycleSummary(),
    getTodayPetCare(),
    getDashboardInsights(),
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

      <InsightsBanner insights={insights} />

      <section className="card p-4" style={{ background: "var(--primary-tint)" }}>
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Hoy</h2>
          <span className="text-sm text-muted">
            {Math.round(summary.totalCalories)} / {calorieTarget} kcal
          </span>
        </div>
        <div className="mt-3">
          <MacroTrio
            macros={[
              { label: "Proteína", value: summary.totalProtein, target: proteinTarget, unit: "g", color: "var(--primary)" },
              { label: "Carbs", value: summary.totalCarbs, target: carbTarget, unit: "g", color: "var(--accent)" },
              { label: "Grasas", value: summary.totalFat, target: fatTarget, unit: "g", color: "var(--icon-sleep)" },
            ]}
          />
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
          currentWakeUps={summary.sleepWakeUps}
        />
      </section>

      <Suspense fallback={<WeatherSkeleton />}>
        <WeatherSection />
      </Suspense>

      {profile.tracks_cycle && cycleSummary && <CycleCard summary={cycleSummary} pcos={profile.pcos} />}

      {profile.tracks_pets && <PetCareQuickLog today={petCare} pausedUntil={profile.pet_care_paused_until} />}

      <section className="card p-4 border-l-4 border-l-accent">
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
