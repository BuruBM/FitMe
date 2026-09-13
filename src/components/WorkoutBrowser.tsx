"use client";

import { useState, useTransition } from "react";
import { Clock, CheckCircle2 } from "lucide-react";
import { WORKOUTS, type Workout } from "@/data/workouts";
import { logWorkout } from "@/lib/actions/tracking";

const ENERGY_LEVELS: { value: Workout["energyLevel"]; label: string }[] = [
  { value: "bajo", label: "Poca energía" },
  { value: "medio", label: "Energía media" },
  { value: "alto", label: "Con ganas" },
];

type EquipmentFilter = "todos" | "sin_equipo" | "con_equipo";

export function WorkoutBrowser() {
  const [energyFilter, setEnergyFilter] = useState<Workout["energyLevel"] | "todos">("todos");
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilter>("todos");
  const [open, setOpen] = useState<Workout | null>(null);

  const list = WORKOUTS.filter((w) => {
    if (energyFilter !== "todos" && w.energyLevel !== energyFilter) return false;
    if (equipmentFilter === "sin_equipo" && w.usesEquipment) return false;
    if (equipmentFilter === "con_equipo" && !w.usesEquipment) return false;
    return true;
  });

  if (open) return <WorkoutDetail workout={open} onBack={() => setOpen(null)} />;

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <FilterChip active={equipmentFilter === "todos"} onClick={() => setEquipmentFilter("todos")} label="Todos" />
        <FilterChip
          active={equipmentFilter === "sin_equipo"}
          onClick={() => setEquipmentFilter("sin_equipo")}
          label="Sin equipo"
        />
        <FilterChip
          active={equipmentFilter === "con_equipo"}
          onClick={() => setEquipmentFilter("con_equipo")}
          label="Con tu equipo"
        />
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <FilterChip active={energyFilter === "todos"} onClick={() => setEnergyFilter("todos")} label="Cualquier energía" />
        {ENERGY_LEVELS.map((l) => (
          <FilterChip
            key={l.value}
            active={energyFilter === l.value}
            onClick={() => setEnergyFilter(l.value)}
            label={l.label}
          />
        ))}
      </div>

      <div className="space-y-2.5">
        {list.map((w) => (
          <button
            key={w.id}
            onClick={() => setOpen(w)}
            className="card w-full text-left p-3.5 hover:border-primary transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">{w.title}</p>
                <p className="text-xs text-muted mt-0.5">{w.focus}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-muted shrink-0">
                <Clock size={12} />
                {w.durationMin}min
              </span>
            </div>
            <div className="flex gap-1.5 mt-2">
              <Tag>{w.equipment}</Tag>
              {w.boneLoading && <Tag>Fortalece huesos</Tag>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border ${
        active ? "bg-primary text-primary-foreground border-primary" : "border-card-border text-muted"
      }`}
    >
      {label}
    </button>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] rounded-full bg-background border border-card-border px-2 py-0.5 text-muted">{children}</span>;
}

function WorkoutDetail({ workout, onBack }: { workout: Workout; onBack: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function complete() {
    startTransition(async () => {
      await logWorkout(workout.id, workout.title, workout.durationMin, workout.energyLevel);
      setDone(true);
    });
  }

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs text-muted">
        ← Volver
      </button>
      <div className="card p-4">
        <h2 className="font-semibold">{workout.title}</h2>
        <p className="text-sm text-muted mt-1">{workout.focus}</p>
        <div className="flex gap-1.5 mt-2">
          <Tag>{workout.durationMin} min</Tag>
          <Tag>{workout.equipment}</Tag>
        </div>

        <ol className="mt-4 space-y-2.5">
          {workout.exercises.map((ex, i) => (
            <li key={i} className="flex justify-between text-sm border-b border-card-border pb-2 last:border-0">
              <span>{ex.name}</span>
              <span className="text-muted">{ex.detail}</span>
            </li>
          ))}
        </ol>

        {done ? (
          <div className="mt-4 flex items-center gap-2 text-primary text-sm font-medium">
            <CheckCircle2 size={18} />
            ¡Entrenamiento registrado!
          </div>
        ) : (
          <button
            onClick={complete}
            disabled={isPending}
            className="mt-4 w-full rounded-lg bg-primary text-primary-foreground font-medium py-2.5 text-sm disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Marcar como completado"}
          </button>
        )}
      </div>
    </div>
  );
}
