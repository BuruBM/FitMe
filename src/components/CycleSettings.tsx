"use client";

import { useState, useTransition } from "react";
import { CircleDot } from "lucide-react";
import { updateCycleSettings } from "@/lib/actions/cycle";
import { IconBadge } from "@/components/IconBadge";

export function CycleSettings({
  avgCycleLength,
  onBirthControl,
  pillStartedOn,
}: {
  avgCycleLength: number;
  onBirthControl: boolean;
  pillStartedOn: string | null;
}) {
  const [length, setLength] = useState(avgCycleLength);
  const [pill, setPill] = useState(onBirthControl);
  const [startedOn, setStartedOn] = useState(pillStartedOn ?? "");
  const [savedState, setSavedState] = useState({ length: avgCycleLength, pill: onBirthControl, startedOn: pillStartedOn ?? "" });
  const [editingStartDate, setEditingStartDate] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const isDirty = length !== savedState.length || pill !== savedState.pill || startedOn !== savedState.startedOn;

  function save() {
    startTransition(async () => {
      await updateCycleSettings(length, pill, startedOn || null);
      setSavedState({ length, pill, startedOn });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <section className="card p-4">
      <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <IconBadge icon={<CircleDot size={13} />} tint="var(--tint-cycle)" color="var(--icon-cycle)" size={24} />
        Ciclo y método anticonceptivo
      </h2>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted">Duración promedio del ciclo (días)</label>
          <input
            type="number"
            min={15}
            max={60}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={pill} onChange={(e) => setPill(e.target.checked)} />
          Estoy tomando pastillas anticonceptivas
        </label>
        {pill && !editingStartDate && (
          <button
            type="button"
            onClick={() => setEditingStartDate(true)}
            className="text-xs text-muted text-left"
          >
            {startedOn ? `Empezaste el ${new Date(startedOn + "T00:00:00").toLocaleDateString("es-AR")}` : "Fecha de inicio no cargada"}
            {" · "}
            <span className="text-primary font-medium">Cambiar</span>
          </button>
        )}
        {pill && editingStartDate && (
          <div>
            <label className="text-xs text-muted">¿Desde cuándo la retomaste/empezaste?</label>
            <input
              type="date"
              value={startedOn}
              onChange={(e) => setStartedOn(e.target.value)}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <p className="text-[11px] text-muted mt-1">
              Así podemos avisarte que los cambios de ánimo son más esperables mientras el cuerpo se acomoda (hasta
              ~3 meses), sin dejar de registrar irritabilidad o sensibilidad después de eso.
            </p>
          </div>
        )}
        <button
          onClick={save}
          disabled={isPending || !isDirty}
          className="w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 disabled:opacity-50"
        >
          {saved ? "Guardado ✓" : "Guardar"}
        </button>
      </div>
    </section>
  );
}
