import { X } from "lucide-react";
import { PHASE_LABELS } from "@/lib/cycle";
import type { HistoryPoint } from "@/lib/queries";

const BLOATING_LABELS = ["Nada", "Leve", "Moderado", "Mucho"];
const VALENCE_EMOJI: Record<number, string> = { "-2": "😣", "-1": "🙁", "0": "😐", "1": "🙂", "2": "😄" };

export function DayDetailPanel({ point, onClose }: { point: HistoryPoint; onClose: () => void }) {
  const dateLabel = new Date(point.date + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="rounded-xl border border-card-border bg-background p-3.5 mt-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold capitalize">{dateLabel}</p>
        <button onClick={onClose} className="text-muted p-1" aria-label="Cerrar">
          <X size={15} />
        </button>
      </div>

      {point.wellness != null && (
        <p className="text-xs text-muted mt-1">
          Bienestar general: <span className="font-medium text-foreground">{point.wellness}/100</span>
        </p>
      )}

      <div className="grid grid-cols-3 gap-x-3 gap-y-2 mt-3 text-xs">
        <Stat label="Ánimo" value={point.mood != null ? `${point.mood}/5` : "-"} />
        <Stat label="Energía" value={point.energy != null ? `${point.energy}/5` : "-"} />
        <Stat label="Irritabilidad" value={point.irritability != null ? `${point.irritability}/5` : "-"} />
        <Stat label="Sensibilidad" value={point.sensitivityLevel != null ? `${point.sensitivityLevel}/5` : "-"} />
        <Stat label="Estrés" value={point.stressLevel != null ? `${point.stressLevel}/5` : "-"} />
        <Stat label="Hinchazón" value={point.bloating != null ? BLOATING_LABELS[point.bloating] : "-"} />
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3 pt-3 border-t border-card-border text-xs">
        <Stat
          label="Sueño"
          value={
            point.sleepHours != null
              ? `${point.sleepHours}h${point.sleepQuality ? ` · ${"★".repeat(point.sleepQuality)}` : ""}`
              : "-"
          }
        />
        <Stat label="Despertares" value={point.sleepWakeUps != null ? String(point.sleepWakeUps) : "-"} />
        <Stat label="Agua" value={point.waterMl > 0 ? `${(point.waterMl / 1000).toFixed(1)}L` : "-"} />
        <Stat label="Peso" value={point.weightKg != null ? `${point.weightKg}kg` : "-"} />
        <Stat label="Calorías" value={point.calories > 0 ? `${Math.round(point.calories)} kcal` : "-"} />
        <Stat label="Proteína" value={point.proteinG > 0 ? `${Math.round(point.proteinG)}g` : "-"} />
        <Stat
          label="Movimiento"
          value={point.workoutNames.length > 0 ? point.workoutNames.join(", ") : "Sin registrar"}
        />
        <Stat label="Milo y Zoe" value={point.petCareDone == null ? "-" : point.petCareDone ? "Completo" : "Incompleto"} />
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3 pt-3 border-t border-card-border text-xs">
        <Stat label="Alcohol" value={point.alcoholUnits ? `${point.alcoholUnits} trago(s)` : "Sin registrar"} />
        <Stat label="Tabaco" value={point.tobaccoUsed == null ? "-" : point.tobaccoUsed ? "Sí" : "No"} />
        <Stat
          label="Contacto social"
          value={point.socialContact != null ? `${point.socialContact}/5` : "-"}
        />
        <Stat
          label="Redes sociales"
          value={point.socialMediaMinutes != null ? `${point.socialMediaMinutes} min` : "-"}
        />
        <Stat
          label="Clima"
          value={point.weatherCondition ? `${point.weatherCondition} (${point.cloudCoverPct}% nublado)` : "-"}
        />
        <Stat label="Ciclo" value={point.cyclePhase ? PHASE_LABELS[point.cyclePhase] : "-"} />
      </div>

      {point.notes && (
        <div className="mt-3 pt-3 border-t border-card-border">
          <p className="text-xs italic">
            {point.notesValence != null ? `${VALENCE_EMOJI[point.notesValence]} ` : ""}
            &quot;{point.notes}&quot;
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted">{label}</p>
      <p className="font-medium mt-0.5">{value}</p>
    </div>
  );
}
