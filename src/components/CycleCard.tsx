"use client";

import { useState, useTransition } from "react";
import { CircleDot, Pill } from "lucide-react";
import { logPeriodStart, setPillTaken } from "@/lib/actions/cycle";
import { PHASE_LABELS, PHASE_MOOD_INFO } from "@/lib/cycle";
import type { CycleSummary } from "@/lib/queries";

export function CycleCard({ summary, pcos }: { summary: CycleSummary; pcos: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [pillTaken, setPillTakenLocal] = useState(summary.pillTakenToday);

  function registerPeriod() {
    startTransition(async () => {
      await logPeriodStart();
      setConfirming(false);
    });
  }

  function togglePill() {
    const next = !pillTaken;
    setPillTakenLocal(next);
    startTransition(() => setPillTaken(next));
  }

  return (
    <section className="card p-4" style={{ background: "var(--tint-cycle)" }}>
      <div className="flex items-center gap-1.5 text-sm font-medium">
        <CircleDot size={16} style={{ color: "var(--icon-cycle)" }} />
        Ciclo
      </div>

      {summary.estimate ? (
        <>
          <p className="text-sm mt-1">
            Día {summary.estimate.cycleDay} · {PHASE_LABELS[summary.estimate.phase]}
          </p>
          {summary.onBirthControl ? (
            <p className="text-xs text-muted mt-1">
              Con anticonceptivos el ciclo hormonal natural está regulado por la pastilla, así que las fases de
              ánimo típicas del ciclo espontáneo no aplican igual.{" "}
              {summary.daysSincePillStart != null && summary.daysSincePillStart < 90
                ? "Igual, el cuerpo puede tardar hasta unos 3 meses en acomodarse — los cambios de ánimo todavía son esperables mientras tanto."
                : "Igual vale registrar cómo te sentís: las hormonas de la pastilla pueden seguir influyendo en el ánimo."}
            </p>
          ) : (
            <p className="text-xs text-muted mt-1">{PHASE_MOOD_INFO[summary.estimate.phase]}</p>
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
      {pcos && !summary.onBirthControl && (
        <p className="text-[11px] text-muted mt-0.5">Es una estimación: con SOP el ciclo puede variar bastante.</p>
      )}

      <div className="flex gap-2 mt-3">
        {confirming ? (
          <>
            <button
              onClick={registerPeriod}
              disabled={isPending}
              className="flex-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium py-2 disabled:opacity-50"
            >
              Confirmar: empezó hoy
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-lg border border-card-border text-xs px-3 py-2 text-muted"
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="flex-1 rounded-lg border border-card-border text-xs font-medium py-2 hover:border-primary"
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
