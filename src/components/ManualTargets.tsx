"use client";

import { useState, useTransition } from "react";
import { SlidersHorizontal } from "lucide-react";
import { updateTargetsManually } from "@/lib/actions/profile";
import { IconBadge } from "@/components/IconBadge";

export function ManualTargets({
  calorieTarget,
  proteinTargetG,
  carbTargetG,
  fatTargetG,
  waterTargetMl,
}: {
  calorieTarget: number | null;
  proteinTargetG: number | null;
  carbTargetG: number | null;
  fatTargetG: number | null;
  waterTargetMl: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [calories, setCalories] = useState(String(calorieTarget ?? 1800));
  const [protein, setProtein] = useState(String(proteinTargetG ?? 90));
  const [carbs, setCarbs] = useState(String(carbTargetG ?? 180));
  const [fat, setFat] = useState(String(fatTargetG ?? 55));
  const [water, setWater] = useState(String((waterTargetMl ?? 2000) / 1000));
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      await updateTargetsManually({
        calorieTarget: Number(calories) || 0,
        proteinTargetG: Number(protein) || 0,
        carbTargetG: Number(carbs) || 0,
        fatTargetG: Number(fat) || 0,
        waterTargetMl: Math.round((Number(water) || 0) * 1000),
      });
      setSaved(true);
      setOpen(false);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  if (!open) {
    return (
      <section className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <IconBadge icon={<SlidersHorizontal size={13} />} tint="var(--tint-food)" color="var(--icon-food)" size={24} />
            Ajustá tus objetivos a mano
          </h2>
          <button onClick={() => setOpen(true)} className="text-xs font-medium text-primary shrink-0">
            {saved ? "Guardado ✓" : "Ajustar"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="card p-4">
      <h2 className="font-semibold text-sm mb-1 flex items-center gap-2">
        <IconBadge icon={<SlidersHorizontal size={13} />} tint="var(--tint-food)" color="var(--icon-food)" size={24} />
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
        <Field label="Agua (L)" value={water} onChange={setWater} step="0.1" />
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={save}
          disabled={isPending}
          className="flex-1 rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 disabled:opacity-50"
        >
          Guardar
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg border border-card-border text-sm px-4 py-2 text-muted"
        >
          Cancelar
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
}) {
  return (
    <div>
      <label className="text-xs text-muted">{label}</label>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
