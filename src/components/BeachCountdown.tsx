import { Sun } from "lucide-react";

export function BeachCountdown({ days }: { days: number }) {
  return (
    <section
      className="card p-4"
      style={{ background: "linear-gradient(135deg, var(--accent-tint), var(--primary-tint))" }}
    >
      <div className="flex items-center gap-2">
        <Sun size={18} className="text-accent" />
        <p className="text-sm font-medium">
          {days === 0
            ? "¡Hoy es el día! Que disfrutes la playa 🏖️"
            : `Faltan ${days} día${days === 1 ? "" : "s"} para tu viaje a la playa`}
        </p>
      </div>
      {days > 0 && (
        <p className="text-xs text-muted mt-1">
          Cada registro de hoy suma para sentirte mejor y con más energía cuando llegue el día.
        </p>
      )}
    </section>
  );
}
