import { WorkoutBrowser } from "@/components/WorkoutBrowser";

export default function WorkoutsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Entrenamiento en casa</h1>
        <p className="text-sm text-muted mt-1">
          Sin gimnasio, sin equipamiento. Elegí según cuánta energía tengas hoy.
        </p>
      </div>
      <WorkoutBrowser />
    </div>
  );
}
