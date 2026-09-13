import { WorkoutBrowser } from "@/components/WorkoutBrowser";
import { WalkQuickLog } from "@/components/WalkQuickLog";
import { WorkoutHistory } from "@/components/WorkoutHistory";
import { getRecentWorkoutLogs } from "@/lib/queries";

export default async function WorkoutsPage() {
  const history = await getRecentWorkoutLogs(21);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Entrenamiento en casa</h1>
        <p className="text-sm text-muted mt-1">Elegí según cuánta energía tengas hoy.</p>
      </div>
      <WalkQuickLog />
      <WorkoutBrowser />
      <WorkoutHistory logs={history} />
    </div>
  );
}
