"use client";

import { useState, useTransition } from "react";
import { Cat, Plane } from "lucide-react";
import { logPetCare, setPetCarePause } from "@/lib/actions/petcare";
import { todayInAppTz } from "@/lib/date";
import type { PetCareLog } from "@/lib/database.types";
import { IconBadge } from "@/components/IconBadge";

export function PetCareQuickLog({ today, pausedUntil }: { today: PetCareLog | null; pausedUntil: string | null }) {
  const [miloMedication, setMiloMedication] = useState(today?.milo_medication ?? false);
  const [miloSupplement, setMiloSupplement] = useState(today?.milo_supplement ?? false);
  const [zoeMedication, setZoeMedication] = useState(today?.zoe_medication ?? false);
  const [zoeSupplement, setZoeSupplement] = useState(today?.zoe_supplement ?? false);
  const [pauseUntil, setPauseUntil] = useState(pausedUntil);
  const [settingPause, setSettingPause] = useState(false);
  const [pauseDateInput, setPauseDateInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const isPaused = pauseUntil != null && pauseUntil >= todayInAppTz();

  function toggle(current: boolean, setter: (v: boolean) => void, field: keyof ReturnType<typeof snapshot>) {
    const next = !current;
    setter(next);
    const state = { ...snapshot(), [field]: next };
    startTransition(() => logPetCare(state));
  }

  function snapshot() {
    return { miloMedication, miloSupplement, zoeMedication, zoeSupplement };
  }

  function confirmPause() {
    if (!pauseDateInput) return;
    setPauseUntil(pauseDateInput);
    setSettingPause(false);
    startTransition(() => setPetCarePause(pauseDateInput));
  }

  function endPause() {
    setPauseUntil(null);
    startTransition(() => setPetCarePause(null));
  }

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <IconBadge icon={<Cat size={14} />} tint="var(--tint-pets)" color="var(--icon-pets)" size={26} />
          Milo y Zoe
        </div>
        {!isPaused && !settingPause && (
          <button
            onClick={() => setSettingPause(true)}
            className="flex items-center gap-1 rounded-full border border-card-border px-2.5 py-1 text-[11px] font-medium text-muted"
          >
            <Plane size={12} />
            Voy de viaje
          </button>
        )}
      </div>

      {isPaused ? (
        <div className="mt-2">
          <p className="text-xs text-muted">
            En pausa por viaje hasta el {new Date(pauseUntil! + "T00:00:00").toLocaleDateString("es-AR")}. No cuenta
            en contra tuyo.
          </p>
          <button
            onClick={endPause}
            disabled={isPending}
            className="mt-2 flex items-center gap-1 rounded-full border border-card-border px-2.5 py-1 text-[11px] font-medium text-muted disabled:opacity-50"
          >
            <Plane size={12} style={{ transform: "scaleX(-1)" }} />
            Ya volví, reactivar
          </button>
        </div>
      ) : settingPause ? (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="date"
            value={pauseDateInput}
            onChange={(e) => setPauseDateInput(e.target.value)}
            className="flex-1 rounded-lg border border-card-border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary"
          />
          <button onClick={confirmPause} className="text-xs font-medium text-primary">
            Listo
          </button>
          <button onClick={() => setSettingPause(false)} className="text-xs text-muted">
            Cancelar
          </button>
        </div>
      ) : (
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
      )}
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
