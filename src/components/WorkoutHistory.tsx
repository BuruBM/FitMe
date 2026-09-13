import { Dumbbell } from "lucide-react";
import type { WorkoutLog } from "@/lib/database.types";

const INTENSITY_LABEL: Record<string, string> = { bajo: "Poca energía", medio: "Energía media", alto: "Con ganas" };

export function WorkoutHistory({ logs }: { logs: WorkoutLog[] }) {
  if (logs.length === 0) {
    return (
      <section className="card p-4">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <Dumbbell size={15} style={{ color: "var(--icon-workout)" }} />
          Historial
        </div>
        <p className="text-sm text-muted mt-1">Tus rutinas y caminatas registradas van a aparecer acá.</p>
      </section>
    );
  }

  return (
    <section className="card p-4">
      <div className="flex items-center gap-1.5 text-sm font-semibold mb-2">
        <Dumbbell size={15} style={{ color: "var(--icon-workout)" }} />
        Historial
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {logs.map((log) => (
          <div key={log.id} className="flex justify-between text-xs border-b border-card-border pb-2 last:border-0 last:pb-0">
            <div>
              <p className="font-medium text-foreground/80">{log.workout_name}</p>
              <p className="text-muted mt-0.5 capitalize">
                {new Date(log.log_date + "T00:00:00").toLocaleDateString("es-AR", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
                {log.intensity ? ` · ${INTENSITY_LABEL[log.intensity] ?? log.intensity}` : ""}
              </p>
            </div>
            <span className="text-muted whitespace-nowrap">{log.duration_min ?? "-"} min</span>
          </div>
        ))}
      </div>
    </section>
  );
}
