"use client";

import { useState, useTransition } from "react";
import { logWeight } from "@/lib/actions/tracking";

export function WeightQuickLog({
  todayWeightKg,
  lastKnownWeightKg,
}: {
  todayWeightKg: number | null;
  lastKnownWeightKg: number | null;
}) {
  const [loggedTodayValue, setLoggedTodayValue] = useState(todayWeightKg);
  const loggedToday = loggedTodayValue != null;
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState(todayWeightKg?.toString() ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    const value = Number(weight);
    if (!value) return;
    startTransition(async () => {
      await logWeight(value);
      setLoggedTodayValue(value);
      setSaved(true);
      setOpen(false);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <section className="card p-4">
      <h2 className="font-semibold mb-1 text-sm">Peso</h2>
      <p className="text-xs text-muted mb-2">
        {loggedToday
          ? `Registraste ${loggedTodayValue}kg hoy ✓`
          : lastKnownWeightKg != null
            ? `Última vez: ${lastKnownWeightKg}kg. Todavía no registraste hoy.`
            : "Todavía no registraste tu peso."}
      </p>

      {!open ? (
        <button
          onClick={() => {
            setWeight(loggedToday ? (loggedTodayValue?.toString() ?? "") : "");
            setOpen(true);
          }}
          className="w-full rounded-lg border border-card-border text-xs py-1.5 font-medium hover:border-primary"
        >
          {saved ? "Guardado ✓" : loggedToday ? "Editar" : "Registrar peso de hoy"}
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            type="number"
            step="0.1"
            autoFocus
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="kg"
            className="flex-1 rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={save}
            disabled={isPending || !weight}
            className="rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      )}
    </section>
  );
}
