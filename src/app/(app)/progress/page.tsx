import { getGamificationSummary, getHistory, getProfile } from "@/lib/queries";
import { BADGES } from "@/lib/gamification";
import { WeightChart } from "@/components/WeightChart";
import { WeightQuickLog } from "@/components/WeightQuickLog";
import { SymptomQuickLog } from "@/components/SymptomQuickLog";

export default async function ProgressPage() {
  const [history, gamification, profile] = await Promise.all([
    getHistory(21),
    getGamificationSummary(),
    getProfile(),
  ]);

  const earnedIds = new Set(gamification?.state.badges ?? []);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Progreso</h1>

      <WeightChart history={history} />
      <WeightQuickLog currentWeightKg={profile?.weight_kg ?? null} />
      <SymptomQuickLog />

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
