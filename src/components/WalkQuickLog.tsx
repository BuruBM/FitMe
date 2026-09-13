"use client";

import { useState, useTransition } from "react";
import { Footprints } from "lucide-react";
import { logWorkout } from "@/lib/actions/tracking";
import { IconBadge } from "@/components/IconBadge";

export function WalkQuickLog() {
  const [minutes, setMinutes] = useState(20);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function save() {
    startTransition(async () => {
      await logWorkout("caminata-libre", "Caminata", minutes, "bajo");
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    });
  }

  return (
    <section className="card p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <IconBadge icon={<Footprints size={14} />} tint="var(--tint-workout)" color="var(--icon-workout)" size={26} />
        Caminata
      </div>
      <p className="text-xs text-muted mt-1">
        Cuenta como movimiento aunque no sea una rutina estructurada — sumá cualquier caminata de hoy.
      </p>
      <div className="flex items-center gap-3 mt-3">
        <button onClick={() => setMinutes((m) => Math.max(5, m - 5))} className="stepper" type="button">
          −
        </button>
        <span className="flex-1 text-center text-sm font-medium">{minutes} min</span>
        <button onClick={() => setMinutes((m) => m + 5)} className="stepper" type="button">
          +
        </button>
      </div>
      <button
        onClick={save}
        disabled={isPending}
        className="mt-3 w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 disabled:opacity-50"
      >
        {done ? "¡Registrada! ✓" : isPending ? "Guardando..." : "Registrar caminata"}
      </button>
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
