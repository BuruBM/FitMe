import { getGamificationSummary, getHistory, getProfile, getRecentSymptomLogs } from "@/lib/queries";
import { BADGES } from "@/lib/gamification";
import { WeightChart } from "@/components/WeightChart";
import { WeightQuickLog } from "@/components/WeightQuickLog";
import { SymptomQuickLog } from "@/components/SymptomQuickLog";
import { SymptomHistory } from "@/components/SymptomHistory";

export default async function ProgressPage() {
  const [history, gamification, profile, symptomLogs] = await Promise.all([
    getHistory(21),
    getGamificationSummary(),
    getProfile(),
    getRecentSymptomLogs(14),
  ]);

  const earnedIds = new Set(gamification?.state.badges ?? []);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Progreso</h1>

      <WeightChart history={history} />
      <WeightQuickLog currentWeightKg={profile?.weight_kg ?? null} />
      <SymptomQuickLog />
      <SymptomHistory logs={symptomLogs} />

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
