"use client";

import { useState, useTransition } from "react";
import { Moon } from "lucide-react";
import { logSleep } from "@/lib/actions/tracking";

export function SleepQuickLog({
  currentHours,
  targetHours,
}: {
  currentHours: number | null;
  targetHours: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(currentHours ?? 6.5);

  function save(quality: number) {
    startTransition(async () => {
      await logSleep(hours, quality);
      setOpen(false);
    });
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-1.5 text-sm font-medium">
        <Moon size={16} className="text-primary" />
        Sueño
      </div>
      <p className="text-xs text-muted mt-1">
        {currentHours != null ? `${currentHours}h anoche` : "Sin registrar"} · meta {targetHours}h
      </p>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 w-full rounded-lg border border-card-border text-xs py-1.5 font-medium hover:border-primary"
        >
          {currentHours != null ? "Editar" : "Registrar"}
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <input
            type="range"
            min={3}
            max={10}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full accent-[var(--primary)]"
          />
          <p className="text-center text-sm font-medium">{hours}h</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((q) => (
              <button
                key={q}
                disabled={isPending}
                onClick={() => save(q)}
                className="flex-1 text-xs rounded-md border border-card-border py-1 hover:border-primary disabled:opacity-50"
                title="Calidad del sueño"
              >
                {"★".repeat(q)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
