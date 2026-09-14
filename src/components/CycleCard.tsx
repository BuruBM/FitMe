"use client";

import { useState, useTransition } from "react";
import { CircleDot, Pill } from "lucide-react";
import { logPeriodStart, setPillTaken } from "@/lib/actions/cycle";
import { PHASE_LABELS, PHASE_MOOD_INFO } from "@/lib/cycle";
import { todayInAppTz } from "@/lib/date";
import type { CycleSummary } from "@/lib/queries";
import { IconBadge } from "@/components/IconBadge";

export function CycleCard({ summary, pcos }: { summary: CycleSummary; pcos: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [periodDate, setPeriodDate] = useState(todayInAppTz());
  const [pillTaken, setPillTakenLocal] = useState(summary.pillTakenToday);

  function registerPeriod() {
    startTransition(async () => {
      await logPeriodStart(periodDate);
      setConfirming(false);
    });
  }

  function togglePill() {
    const next = !pillTaken;
    setPillTakenLocal(next);
    startTransition(() => setPillTaken(next));
  }

  return (
    <section className="card p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <IconBadge icon={<CircleDot size={14} />} tint="var(--tint-cycle)" color="var(--icon-cycle)" size={26} />
        Ciclo
      </div>

      {summary.estimate ? (
        <>
          <p className="text-sm font-medium mt-1">
            Fase {PHASE_LABELS[summary.estimate.phase]} · día {summary.estimate.cycleDay} del ciclo
          </p>
          <p className="text-xs text-muted mt-1">{PHASE_MOOD_INFO[summary.estimate.phase]}</p>
          {summary.onBirthControl && summary.daysSincePillStart != null && summary.daysSincePillStart < 90 && (
            <p className="text-xs text-muted mt-1">
              Recién retomaste la pastilla — el cuerpo puede tardar hasta 3 meses en acomodarse, así que los
              cambios de ánimo son esperables mientras tanto.
            </p>
          )}
          {summary.daysUntilNextPeriod != null && summary.daysUntilNextPeriod <= 3 && (
            <p className="text-xs font-medium mt-1.5" style={{ color: "var(--icon-cycle)" }}>
              {summary.daysUntilNextPeriod <= 0
                ? "Tu período podría empezar hoy o ya haberse retrasado."
                : `Tu período podría empezar en los próximos ${summary.daysUntilNextPeriod} día${summary.daysUntilNextPeriod === 1 ? "" : "s"}.`}
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-muted mt-1">Registrá el inicio de tu último período para verlo acá.</p>
      )}
      {pcos && (
        <p className="text-[11px] text-muted mt-0.5">Es una estimación: con SOP el ciclo puede variar bastante.</p>
      )}

      <div className="mt-3">
        {confirming ? (
          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium text-foreground/85 mb-1 block">¿Cuándo empezó?</label>
              <input
                type="date"
                value={periodDate}
                max={todayInAppTz()}
                onChange={(e) => setPeriodDate(e.target.value)}
                className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={registerPeriod}
                disabled={isPending}
                className="flex-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium py-2 disabled:opacity-50"
              >
                Confirmar
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-card-border text-xs px-3 py-2 text-muted"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setPeriodDate(todayInAppTz());
              setConfirming(true);
            }}
            className="w-full rounded-lg border border-card-border text-xs font-medium py-2 hover:border-primary"
          >
            Registrar inicio de período
          </button>
        )}
      </div>

      {summary.onBirthControl && (
        <button
          onClick={togglePill}
          disabled={isPending}
          className={`mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium py-2 border disabled:opacity-50 ${
            pillTaken ? "bg-primary/10 border-primary text-primary" : "border-card-border text-muted"
          }`}
        >
          <Pill size={14} />
          {pillTaken ? "Pastilla tomada hoy" : "Marcar pastilla de hoy"}
        </button>
      )}
    </section>
  );
}
