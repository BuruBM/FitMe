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
      <div className="flex gap-2 overflow-x-auto pb-1">
        {logs.map((log) => (
          <div
            key={log.id}
            className="shrink-0 min-w-16 rounded-xl border border-card-border px-2.5 py-2 text-center"
            style={{ background: "var(--tint-sleep)" }}
          >
            <p className="text-[10px] text-muted capitalize">
              {new Date(log.log_date + "T00:00:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric" })}
            </p>
            <p className="text-sm font-semibold mt-1">{log.hours}h</p>
            {log.quality != null && <p className="text-[10px] mt-0.5">{"★".repeat(log.quality)}</p>}
            {(log.bedtime || log.wake_ups > 0) && (
              <p className="text-[9px] text-muted mt-0.5 whitespace-nowrap">
                {log.bedtime ? log.bedtime.slice(0, 5) : ""}
                {log.bedtime && log.wake_ups > 0 ? " · " : ""}
                {log.wake_ups > 0 ? `${log.wake_ups} desp.` : ""}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
