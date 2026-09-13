"use client";

import { useState, useTransition } from "react";
import { SlidersHorizontal } from "lucide-react";
import { updateTargetsManually } from "@/lib/actions/profile";

export function ManualTargets({
  calorieTarget,
  proteinTargetG,
  carbTargetG,
  fatTargetG,
}: {
  calorieTarget: number | null;
  proteinTargetG: number | null;
  carbTargetG: number | null;
  fatTargetG: number | null;
}) {
  const [calories, setCalories] = useState(calorieTarget ?? 1800);
  const [protein, setProtein] = useState(proteinTargetG ?? 90);
  const [carbs, setCarbs] = useState(carbTargetG ?? 180);
  const [fat, setFat] = useState(fatTargetG ?? 55);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      await updateTargetsManually({ calorieTarget: calories, proteinTargetG: protein, carbTargetG: carbs, fatTargetG: fat });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <section className="card p-4" style={{ background: "var(--tint-food)" }}>
      <h2 className="font-semibold text-sm mb-1 flex items-center gap-1.5">
        <SlidersHorizontal size={15} style={{ color: "var(--icon-food)" }} />
        Ajustá tus objetivos a mano
      </h2>
      <p className="text-xs text-muted mb-3">
        Los calculamos automáticamente, pero son un punto de partida. Si un número no es realista para vos,
        cambialo acá — es tu objetivo, no el nuestro.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Calorías (kcal)" value={calories} onChange={setCalories} />
        <Field label="Proteína (g)" value={protein} onChange={setProtein} />
        <Field label="Carbohidratos (g)" value={carbs} onChange={setCarbs} />
        <Field label="Grasas (g)" value={fat} onChange={setFat} />
      </div>
      <button
        onClick={save}
        disabled={isPending}
        className="w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 mt-3 disabled:opacity-50"
      >
        {saved ? "Guardado ✓" : "Guardar"}
      </button>
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-xs text-muted">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
