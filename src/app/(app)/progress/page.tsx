import {
  getGamificationSummary,
  getHistory,
  getMeasurementHistory,
  getMeasurementTrend,
  getProfile,
  getRecentSleepLogs,
  getTodaySummary,
  getTodaySymptomLog,
  getWeeklyReview,
} from "@/lib/queries";
import { BADGES } from "@/lib/gamification";
import { ProgressCharts } from "@/components/ProgressCharts";
import { WeightQuickLog } from "@/components/WeightQuickLog";
import { MeasurementsQuickLog } from "@/components/MeasurementsQuickLog";
import { MeasurementsHistory } from "@/components/MeasurementsHistory";
import { SymptomQuickLog } from "@/components/SymptomQuickLog";
import { SleepHistory } from "@/components/SleepHistory";
import { WeeklyReviewCard } from "@/components/WeeklyReviewCard";
import { FactorsPanel } from "@/components/FactorsPanel";

export default async function ProgressPage() {
  const [history, gamification, profile, sleepLogs, measurementTrend, measurementHistory, todaySummary, todaySymptomLog] =
    await Promise.all([
      getHistory(365),
      getGamificationSummary(),
      getProfile(),
      getRecentSleepLogs(14),
      getMeasurementTrend(),
      getMeasurementHistory(20),
      getTodaySummary(),
      getTodaySymptomLog(),
    ]);
  const weeklyReview = await getWeeklyReview(history.slice(-7));

  const earnedIds = new Set(gamification?.state.badges ?? []);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Progreso</h1>

      <WeeklyReviewCard review={weeklyReview} />
      <ProgressCharts history={history} />
      <FactorsPanel history={history} />
      <SymptomQuickLog existing={todaySymptomLog} />
      <WeightQuickLog todayWeightKg={todaySummary.weightKg} lastKnownWeightKg={profile?.weight_kg ?? null} />
      <MeasurementsQuickLog latest={measurementTrend.latest} previous={measurementTrend.previous} />
      <MeasurementsHistory logs={measurementHistory} />
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
