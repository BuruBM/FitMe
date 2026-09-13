import type { SymptomLog } from "@/lib/database.types";

const BLOATING_LABELS = ["Nada", "Leve", "Moderado", "Mucho"];
const VALENCE_EMOJI: Record<number, string> = { "-2": "😣", "-1": "🙁", "0": "😐", "1": "🙂", "2": "😄" };

export function SymptomHistory({ logs }: { logs: SymptomLog[] }) {
  if (logs.length === 0) {
    return (
      <section className="card p-4">
        <h2 className="font-semibold mb-1 text-sm">Historial reciente</h2>
        <p className="text-sm text-muted">
          Todavía no hay registros de cómo te sentís. Se van a ir sumando acá para que veas el patrón.
        </p>
      </section>
    );
  }

  return (
    <section className="card p-4">
      <h2 className="font-semibold mb-2 text-sm">Historial reciente</h2>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {logs.map((log) => (
          <div key={log.id} className="text-xs border-b border-card-border pb-2 last:border-0 last:pb-0">
            <p className="font-medium text-foreground/80">
              {new Date(log.log_date + "T00:00:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })}
            </p>
            <p className="text-muted mt-0.5">
              Ánimo {log.mood ?? "-"}/5 · Energía {log.energy ?? "-"}/5 · Irritabilidad {log.irritability ?? "-"}/5 ·
              Hinchazón {log.bloating != null ? BLOATING_LABELS[log.bloating] : "-"}
              {log.movement_level != null ? ` · Movimiento ${log.movement_level}/5` : ""}
              {log.social_contact != null ? ` · Contacto social ${log.social_contact}/5` : ""}
              {log.social_media_minutes != null ? ` · ${log.social_media_minutes}min redes` : ""}
              {log.alcohol_units > 0 ? ` · ${log.alcohol_units} trago${log.alcohol_units === 1 ? "" : "s"}` : ""}
              {log.tobacco_used ? " · Fumó" : ""}
              {log.weather_condition ? ` · ${log.weather_condition} (${log.cloud_cover_pct}% nublado)` : ""}
            </p>
            {log.notes && (
              <p className="mt-1 italic">
                {log.notes_valence != null ? `${VALENCE_EMOJI[log.notes_valence]} ` : ""}
                &quot;{log.notes}&quot;
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
