import { Sun } from "lucide-react";

export function BeachCountdown({ days }: { days: number }) {
  return (
    <section className="card p-3.5 border-l-4 border-l-accent">
      <div className="flex items-center gap-2">
        <Sun size={17} className="text-accent shrink-0" />
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
