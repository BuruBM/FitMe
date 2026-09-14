"use client";

import { useState, useTransition } from "react";
import { Moon } from "lucide-react";
import { logSleep } from "@/lib/actions/tracking";
import { computeSleepHours } from "@/lib/sleep";
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
  const [bedtime, setBedtime] = useState(currentBedtime?.slice(0, 5) ?? "23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [wakeUps, setWakeUps] = useState(currentWakeUps ?? 0);
  const [saved, setSaved] = useState<{ hours: number; bedtime: string; wakeUps: number } | null>(null);

  const hours = computeSleepHours(bedtime, wakeTime);
  const displayHours = saved?.hours ?? currentHours;
  const displayBedtime = saved?.bedtime ?? currentBedtime?.slice(0, 5) ?? null;
  const displayWakeUps = saved?.wakeUps ?? currentWakeUps;

  function save() {
    startTransition(async () => {
      await logSleep({ bedtime, wakeTime, wakeUps });
      setSaved({ hours, bedtime, wakeUps });
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
        {displayHours != null ? `${displayHours}h anoche` : "Sin registrar"} · meta {targetHours}h
        {displayBedtime ? ` · te dormiste ${displayBedtime}` : ""}
        {displayWakeUps ? ` · te despertaste ${displayWakeUps}x` : ""}
      </p>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 w-full rounded-lg border border-card-border text-xs py-1.5 font-medium hover:border-primary"
        >
          {displayHours != null ? "Editar" : "Registrar"}
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-muted">¿A qué hora te dormiste?</label>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted">¿A qué hora te levantaste?</label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
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
