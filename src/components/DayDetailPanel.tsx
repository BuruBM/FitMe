import { X } from "lucide-react";
import Link from "next/link";
import { PHASE_LABELS } from "@/lib/cycle";
import type { HistoryPoint } from "@/lib/queries";

const BLOATING_LABELS = ["Nada", "Leve", "Moderado", "Mucho"];
const VALENCE_EMOJI: Record<number, string> = { "-2": "😣", "-1": "🙁", "0": "😐", "1": "🙂", "2": "😄" };

interface Stat {
  label: string;
  value: string;
}

function buildStats(point: HistoryPoint): Stat[] {
  const stats: (Stat | false | null)[] = [
    point.mood != null && { label: "Ánimo", value: `${point.mood}/5` },
    point.energy != null && { label: "Energía", value: `${point.energy}/5` },
    point.irritability != null && { label: "Irritabilidad", value: `${point.irritability}/5` },
    point.sensitivityLevel != null && { label: "Sensibilidad", value: `${point.sensitivityLevel}/5` },
    point.stressLevel != null && { label: "Estrés", value: `${point.stressLevel}/5` },
    point.bloating != null && { label: "Hinchazón", value: BLOATING_LABELS[point.bloating] },
    point.sleepHours != null && {
      label: "Sueño",
      value: `${point.sleepHours}h${point.sleepQuality ? ` · ${"★".repeat(point.sleepQuality)}` : ""}`,
    },
    point.sleepWakeUps != null && point.sleepWakeUps > 0 && { label: "Despertares", value: String(point.sleepWakeUps) },
    point.waterMl > 0 && { label: "Agua", value: `${point.waterMl}ml` },
    point.weightKg != null && { label: "Peso", value: `${point.weightKg}kg` },
    point.calories > 0 && { label: "Calorías", value: `${Math.round(point.calories)} kcal` },
    point.proteinG > 0 && { label: "Proteína", value: `${Math.round(point.proteinG)}g` },
    { label: "Movimiento", value: point.workoutNames.length > 0 ? point.workoutNames.join(", ") : "Sin registrar" },
    point.petCareItemsDone != null && { label: "Milo y Zoe", value: `${point.petCareItemsDone}/4 tareas` },
    point.alcoholUnits != null && {
      label: "Alcohol",
      value: point.alcoholUnits > 0 ? `${point.alcoholUnits} trago(s)` : "Sin alcohol",
    },
    point.tobaccoUsed != null && { label: "Tabaco", value: point.tobaccoUsed ? "Sí" : "No" },
    point.socialContact != null && { label: "Contacto social", value: `${point.socialContact}/5` },
    point.socialMediaMinutes != null && { label: "Redes", value: `${point.socialMediaMinutes} min` },
    Boolean(point.weatherCondition) && { label: "Clima", value: `${point.weatherCondition} (${point.cloudCoverPct}%)` },
    Boolean(point.cyclePhase) && { label: "Ciclo", value: point.cyclePhase ? PHASE_LABELS[point.cyclePhase] : "" },
    point.pillTaken != null && { label: "Pastilla", value: point.pillTaken ? "Tomada" : "No tomada" },
  ];
  return stats.filter((s): s is Stat => Boolean(s));
}

export function DayDetailPanel({ point, onClose }: { point: HistoryPoint; onClose: () => void }) {
  const dateLabel = new Date(point.date + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const stats = buildStats(point);

  return (
    <div className="rounded-xl border border-card-border border-l-4 border-l-primary bg-background p-3 mt-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold capitalize">{dateLabel}</p>
          {point.wellness != null && (
            <p className="text-xs text-muted">
              Bienestar: <span className="font-medium text-foreground">{point.wellness}/100</span>
            </p>
          )}
        </div>
        <button onClick={onClose} className="text-muted p-1 -mr-1 -mt-1" aria-label="Cerrar">
          <X size={15} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-x-3 gap-y-1.5 mt-2.5 text-xs">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-muted">{s.label}</p>
            <p className="font-medium leading-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {point.notes && (
        <p className="text-xs italic mt-2.5 pt-2.5 border-t border-card-border">
          {point.notesValence != null ? `${VALENCE_EMOJI[point.notesValence]} ` : ""}
          &quot;{point.notes}&quot;
        </p>
      )}

      <Link
        href={`/day/${point.date}`}
        className="mt-2.5 pt-2.5 border-t border-card-border block text-xs font-medium text-primary"
      >
        Editar este día →
      </Link>
    </div>
  );
}
