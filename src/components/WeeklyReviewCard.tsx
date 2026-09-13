import { Sparkles } from "lucide-react";
import type { WeeklyReview } from "@/lib/weeklyReview";

const TREND_LABEL: Record<NonNullable<WeeklyReview["moodTrend"]>, string> = {
  subiendo: "subiendo 📈",
  bajando: "bajando 📉",
  estable: "estable",
};

export function WeeklyReviewCard({ review }: { review: WeeklyReview | null }) {
  if (!review) {
    return (
      <section className="card p-4" style={{ background: "var(--primary-tint)" }}>
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Sparkles size={16} className="text-primary" />
          Tu semana
        </div>
        <p className="text-xs text-muted mt-1">
          Todavía no hay suficientes días registrados esta semana. En unos días vas a tener acá un resumen y
          recomendaciones concretas para la próxima.
        </p>
      </section>
    );
  }

  return (
    <section className="card p-4" style={{ background: "var(--primary-tint)" }}>
      <div className="flex items-center gap-1.5 text-sm font-medium">
        <Sparkles size={16} className="text-primary" />
        Tu semana
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-xs">
        {review.avgProteinPct != null && (
          <div>
            <p className="text-muted">Proteína promedio</p>
            <p className="font-medium">{Math.round(review.avgProteinPct)}% del objetivo</p>
          </div>
        )}
        {review.avgSleepHours != null && (
          <div>
            <p className="text-muted">Sueño promedio</p>
            <p className="font-medium">{review.avgSleepHours.toFixed(1)}h</p>
          </div>
        )}
        <div>
          <p className="text-muted">Movimiento</p>
          <p className="font-medium">
            {review.workoutsCount} día{review.workoutsCount === 1 ? "" : "s"}
          </p>
        </div>
        {review.moodTrend && (
          <div>
            <p className="text-muted">Ánimo</p>
            <p className="font-medium">{TREND_LABEL[review.moodTrend]}</p>
          </div>
        )}
      </div>

      {review.recommendations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-card-border space-y-2">
          <p className="text-xs font-medium">Para la próxima semana</p>
          {review.recommendations.map((rec, i) => (
            <p key={i} className="text-xs text-muted">
              • {rec}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
