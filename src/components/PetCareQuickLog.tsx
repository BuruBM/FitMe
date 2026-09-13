"use client";

import { useState, useTransition } from "react";
import { PawPrint } from "lucide-react";
import { logPetCare } from "@/lib/actions/petcare";
import type { PetCareLog } from "@/lib/database.types";

export function PetCareQuickLog({ today }: { today: PetCareLog | null }) {
  const [miloMedication, setMiloMedication] = useState(today?.milo_medication ?? false);
  const [miloSupplement, setMiloSupplement] = useState(today?.milo_supplement ?? false);
  const [zoeMedication, setZoeMedication] = useState(today?.zoe_medication ?? false);
  const [zoeSupplement, setZoeSupplement] = useState(today?.zoe_supplement ?? false);
  const [isPending, startTransition] = useTransition();

  function toggle(current: boolean, setter: (v: boolean) => void, field: keyof ReturnType<typeof snapshot>) {
    const next = !current;
    setter(next);
    const state = { ...snapshot(), [field]: next };
    startTransition(() => logPetCare(state));
  }

  function snapshot() {
    return { miloMedication, miloSupplement, zoeMedication, zoeSupplement };
  }

  return (
    <section className="card p-4">
      <div className="flex items-center gap-1.5 text-sm font-medium">
        <PawPrint size={16} className="text-primary" />
        Milo y Zoe
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <PetColumn
          name="Milo"
          medication={miloMedication}
          supplement={miloSupplement}
          onToggleMedication={() => toggle(miloMedication, setMiloMedication, "miloMedication")}
          onToggleSupplement={() => toggle(miloSupplement, setMiloSupplement, "miloSupplement")}
          disabled={isPending}
        />
        <PetColumn
          name="Zoe"
          medication={zoeMedication}
          supplement={zoeSupplement}
          onToggleMedication={() => toggle(zoeMedication, setZoeMedication, "zoeMedication")}
          onToggleSupplement={() => toggle(zoeSupplement, setZoeSupplement, "zoeSupplement")}
          disabled={isPending}
        />
      </div>
    </section>
  );
}

function PetColumn({
  name,
  medication,
  supplement,
  onToggleMedication,
  onToggleSupplement,
  disabled,
}: {
  name: string;
  medication: boolean;
  supplement: boolean;
  onToggleMedication: () => void;
  onToggleSupplement: () => void;
  disabled: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted mb-1.5">{name}</p>
      <div className="space-y-1.5">
        <ToggleButton label="Medicación" checked={medication} onClick={onToggleMedication} disabled={disabled} />
        <ToggleButton label="Suplemento" checked={supplement} onClick={onToggleSupplement} disabled={disabled} />
      </div>
    </div>
  );
}

function ToggleButton({
  label,
  checked,
  onClick,
  disabled,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-xs rounded-md py-1.5 border disabled:opacity-50 ${
        checked ? "bg-primary text-primary-foreground border-primary" : "border-card-border text-muted"
      }`}
    >
      {checked ? "✓ " : ""}
      {label}
    </button>
  );
}
