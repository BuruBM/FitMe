"use client";

import { useState, useTransition } from "react";
import { Moon } from "lucide-react";
import { logSleep } from "@/lib/actions/tracking";

export function SleepQuickLog({
  currentHours,
  targetHours,
  currentBedtime,
}: {
  currentHours: number | null;
  targetHours: number;
  currentBedtime: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(currentHours ?? 6.5);
  const [bedtime, setBedtime] = useState(currentBedtime?.slice(0, 5) ?? "23:00");

  function save(quality: number) {
    startTransition(async () => {
      await logSleep(hours, quality, bedtime);
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
        {currentBedtime ? ` · te dormiste ${currentBedtime.slice(0, 5)}` : ""}
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
          <div>
            <label className="text-[11px] text-muted">¿A qué hora te dormiste (o pensás dormirte)?</label>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <input
            type="range"
            min={3}
            max={10}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full accent-[var(--primary)]"
          />
          <p className="text-center text-sm font-medium">{hours}h dormidas</p>
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
