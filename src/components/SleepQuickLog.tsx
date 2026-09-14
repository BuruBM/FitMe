"use client";

import { useState, useTransition } from "react";
import { Moon } from "lucide-react";
import { logSleep } from "@/lib/actions/tracking";
import { IconBadge } from "@/components/IconBadge";

export function SleepQuickLog({
  currentHours,
  targetHours,
  currentBedtime,
  currentWakeUps,
}: {
  currentHours: number | null;
  targetHours: number;
  currentBedtime: string | null;
  currentWakeUps: number | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(currentHours ?? 6.5);
  const [bedtime, setBedtime] = useState(currentBedtime?.slice(0, 5) ?? "23:00");
  const [wakeUps, setWakeUps] = useState(currentWakeUps ?? 0);

  function save() {
    startTransition(async () => {
      await logSleep({ hours, bedtime, wakeUps });
      setOpen(false);
    });
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <IconBadge icon={<Moon size={14} />} tint="var(--tint-sleep)" color="var(--icon-sleep)" size={26} />
        Sueño
      </div>
      <p className="text-xs text-muted mt-1">
        {currentHours != null ? `${currentHours}h anoche` : "Sin registrar"} · meta {targetHours}h
        {currentBedtime ? ` · te dormiste ${currentBedtime.slice(0, 5)}` : ""}
        {currentWakeUps ? ` · te despertaste ${currentWakeUps}x` : ""}
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
          <div className="flex items-center justify-between">
            <label className="text-[11px] text-muted">¿Te despertaste durante la noche?</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWakeUps((n) => Math.max(0, n - 1))}
                className="w-6 h-6 rounded-full border border-card-border text-sm"
              >
                −
              </button>
              <span className="w-4 text-center text-sm">{wakeUps}</span>
              <button
                type="button"
                onClick={() => setWakeUps((n) => n + 1)}
                className="w-6 h-6 rounded-full border border-card-border text-sm"
              >
                +
              </button>
            </div>
          </div>
          <button
            onClick={save}
            disabled={isPending}
            className="w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      )}
    </div>
  );
}
