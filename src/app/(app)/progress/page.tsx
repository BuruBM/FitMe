import {
  getGamificationSummary,
  getHistory,
  getLatestMeasurement,
  getProfile,
  getRecentSleepLogs,
  getRecentSymptomLogs,
  getWeeklyReview,
} from "@/lib/queries";
import { BADGES } from "@/lib/gamification";
import { ProgressCharts } from "@/components/ProgressCharts";
import { WeightQuickLog } from "@/components/WeightQuickLog";
import { MeasurementsQuickLog } from "@/components/MeasurementsQuickLog";
import { SymptomQuickLog } from "@/components/SymptomQuickLog";
import { SymptomHistory } from "@/components/SymptomHistory";
import { SleepHistory } from "@/components/SleepHistory";
import { WeeklyReviewCard } from "@/components/WeeklyReviewCard";
import { FactorsPanel } from "@/components/FactorsPanel";
import { computeFactors } from "@/lib/factors";

export default async function ProgressPage() {
  const [history, gamification, profile, symptomLogs, sleepLogs, weeklyReview, measurement] = await Promise.all([
    getHistory(365),
    getGamificationSummary(),
    getProfile(),
    getRecentSymptomLogs(14),
    getRecentSleepLogs(14),
    getWeeklyReview(),
    getLatestMeasurement(),
  ]);

  const earnedIds = new Set(gamification?.state.badges ?? []);
  const factors = computeFactors(history, profile?.on_birth_control ?? false);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Progreso</h1>

      <WeeklyReviewCard review={weeklyReview} />
      <ProgressCharts history={history} />
      <FactorsPanel factors={factors} />
      <WeightQuickLog currentWeightKg={profile?.weight_kg ?? null} />
      <MeasurementsQuickLog currentWaistCm={measurement?.waist_cm ?? null} currentHipCm={measurement?.hip_cm ?? null} />
      <SymptomQuickLog />
      <SymptomHistory logs={symptomLogs} />
      <SleepHistory logs={sleepLogs} />

      <section className="card p-4">
        <h2 className="font-semibold mb-3">Logros</h2>
        <div className="grid grid-cols-2 gap-2">
          {BADGES.map((b) => {
            const earned = earnedIds.has(b.id);
            return (
              <div
                key={b.id}
                className={`rounded-lg border px-3 py-2.5 text-center ${
                  earned ? "border-primary bg-primary/5" : "border-card-border opacity-50"
                }`}
              >
                <div className="text-xl">{b.icon}</div>
                <p className="text-xs font-medium mt-1">{b.title}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
