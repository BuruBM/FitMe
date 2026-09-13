import type { SleepLog } from "@/lib/database.types";

export function SleepHistory({ logs }: { logs: SleepLog[] }) {
  if (logs.length === 0) {
    return (
      <section className="card p-4">
        <h2 className="font-semibold mb-1 text-sm">Historial de sueño</h2>
        <p className="text-sm text-muted">Todavía no hay registros de sueño.</p>
      </section>
    );
  }

  return (
    <section className="card p-4">
      <h2 className="font-semibold mb-2 text-sm">Historial de sueño</h2>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {logs.map((log) => (
          <div key={log.id} className="flex justify-between text-xs border-b border-card-border pb-2 last:border-0 last:pb-0">
            <span className="font-medium text-foreground/80 capitalize">
              {new Date(log.log_date + "T00:00:00").toLocaleDateString("es-AR", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
            <span className="text-muted text-right">
              {log.hours}h{log.quality ? ` · ${"★".repeat(log.quality)}` : ""}
              {log.bedtime ? ` · ${log.bedtime.slice(0, 5)}` : ""}
              {log.wake_ups > 0 ? ` · ${log.wake_ups} despertar${log.wake_ups === 1 ? "" : "es"}` : ""}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
