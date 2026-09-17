"use client";

import { useState, useTransition } from "react";
import { Dumbbell, Trash2 } from "lucide-react";
import { logWorkout, deleteWorkoutLog } from "@/lib/actions/tracking";
import { WORKOUTS } from "@/data/workouts";
import type { WorkoutLog } from "@/lib/database.types";

const INTENSITY_LABEL: Record<string, string> = { bajo: "Poca energía", medio: "Energía media", alto: "Con ganas" };
const INTENSITIES = ["bajo", "medio", "alto"] as const;
const FREE_ACTIVITY = "__otra__";

export function DayWorkoutEditor({ logs, date }: { logs: WorkoutLog[]; date: string }) {
  const [items, setItems] = useState(logs);
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<string>(FREE_ACTIVITY);
  const [customName, setCustomName] = useState("Caminata");
  const [minutes, setMinutes] = useState(20);
  const [intensity, setIntensity] = useState<(typeof INTENSITIES)[number]>("bajo");
  const [isPending, startTransition] = useTransition();

  function remove(id: string) {
    setItems((prev) => prev.filter((l) => l.id !== id));
    startTransition(() => deleteWorkoutLog(id));
  }

  function add() {
    const workout = WORKOUTS.find((w) => w.id === choice);
    const workoutId = workout?.id ?? "actividad-libre";
    const name = workout?.title ?? customName;
    const dur = workout?.durationMin ?? minutes;
    const int = workout?.energyLevel ?? intensity;

    startTransition(async () => {
      await logWorkout(workoutId, name, dur, int, date);
      setItems((prev) => [
        ...prev,
        {
          id: `optimistic-${Date.now()}`,
          user_id: "",
          completed_at: new Date().toISOString(),
          log_date: date,
          workout_id: workoutId,
          workout_name: name,
          duration_min: dur,
          intensity: int,
        },
      ]);
      setOpen(false);
      setChoice(FREE_ACTIVITY);
      setCustomName("Caminata");
    });
  }

  return (
    <section className="card p-4">
      <div className="flex items-center gap-1.5 text-sm font-semibold mb-2">
        <Dumbbell size={15} style={{ color: "var(--icon-workout)" }} />
        Ejercicio
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-muted">Todavía no registraste actividad este día.</p>
      ) : (
        <div className="space-y-2">
          {items.map((log) => (
            <div key={log.id} className="flex items-center justify-between text-xs">
              <div>
                <p className="font-medium text-foreground/80">{log.workout_name}</p>
                <p className="text-muted mt-0.5">
                  {log.duration_min ?? "-"} min
                  {log.intensity ? ` · ${INTENSITY_LABEL[log.intensity] ?? log.intensity}` : ""}
                </p>
              </div>
              <button
                onClick={() => remove(log.id)}
                disabled={isPending}
                className="text-muted hover:text-danger p-1 disabled:opacity-40"
                aria-label="Eliminar"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 w-full rounded-lg border border-card-border text-xs py-1.5 font-medium hover:border-primary"
        >
          + Agregar actividad
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <select
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
            className="w-full rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
          >
            <option value={FREE_ACTIVITY}>Otra actividad (caminata, etc.)</option>
            {WORKOUTS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.title} ({w.durationMin} min)
              </option>
            ))}
          </select>

          {choice === FREE_ACTIVITY && (
            <>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Nombre de la actividad"
                className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <div className="flex items-center gap-3">
                <button onClick={() => setMinutes((m) => Math.max(5, m - 5))} className="stepper" type="button">
                  −
                </button>
                <span className="flex-1 text-center text-sm font-medium">{minutes} min</span>
                <button onClick={() => setMinutes((m) => m + 5)} className="stepper" type="button">
                  +
                </button>
              </div>
              <div className="flex gap-1.5">
                {INTENSITIES.map((i) => (
                  <button
                    key={i}
                    onClick={() => setIntensity(i)}
                    className={`flex-1 text-xs rounded-md py-1.5 border ${
                      intensity === i ? "bg-primary text-primary-foreground border-primary" : "border-card-border text-muted"
                    }`}
                  >
                    {INTENSITY_LABEL[i]}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="flex gap-2">
            <button
              onClick={add}
              disabled={isPending}
              className="flex-1 rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 disabled:opacity-50"
            >
              Guardar
            </button>
            <button onClick={() => setOpen(false)} className="rounded-lg border border-card-border text-sm px-4 py-2 text-muted">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .stepper {
          width: 2rem;
          height: 2rem;
          border-radius: 9999px;
          border: 1px solid var(--card-border);
          font-size: 1.1rem;
          line-height: 1;
        }
      `}</style>
    </section>
  );
}
