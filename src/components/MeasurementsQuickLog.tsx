"use client";

import { useState, useTransition } from "react";
import { logMeasurements } from "@/lib/actions/tracking";
import { todayInAppTz } from "@/lib/date";
import type { BodyMeasurement } from "@/lib/database.types";

const FIELDS = [
  { key: "waist", label: "Cintura", placeholder: "ej: 78" },
  { key: "abdomen", label: "Abdomen", placeholder: "a la altura del ombligo" },
  { key: "hip", label: "Cadera", placeholder: "opcional" },
] as const;
const EXTRA_FIELDS = [
  { key: "thigh", label: "Muslo", placeholder: "opcional" },
  { key: "arm", label: "Brazo", placeholder: "opcional" },
] as const;

function delta(latest: number | null, previous: number | null): string | null {
  if (latest == null || previous == null) return null;
  const diff = Math.round((latest - previous) * 10) / 10;
  if (diff === 0) return "sin cambios";
  return `${diff > 0 ? "+" : ""}${diff}cm desde la última medición`;
}

export function MeasurementsQuickLog({
  latest,
  previous,
  date,
}: {
  latest: BodyMeasurement | null;
  previous: BodyMeasurement | null;
  date?: string;
}) {
  const targetDate = date ?? todayInAppTz();
  const isToday = targetDate === todayInAppTz();
  const [loggedTodayLocal, setLoggedTodayLocal] = useState(latest?.log_date === targetDate);
  const [savedWaist, setSavedWaist] = useState(latest?.waist_cm ?? null);
  const [savedAbdomen, setSavedAbdomen] = useState(latest?.abdomen_cm ?? null);
  const loggedToday = loggedTodayLocal;
  const [open, setOpen] = useState(false);
  const [waist, setWaist] = useState("");
  const [abdomen, setAbdomen] = useState("");
  const [hip, setHip] = useState("");
  const [thigh, setThigh] = useState("");
  const [arm, setArm] = useState("");
  const [showExtra, setShowExtra] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const values = { waist, abdomen, hip, thigh, arm };
  const setters = { waist: setWaist, abdomen: setAbdomen, hip: setHip, thigh: setThigh, arm: setArm };

  function startEditing() {
    setWaist(loggedToday ? (savedWaist?.toString() ?? "") : "");
    setAbdomen(loggedToday ? (savedAbdomen?.toString() ?? "") : "");
    setHip(loggedToday ? (latest?.hip_cm?.toString() ?? "") : "");
    setThigh(loggedToday ? (latest?.thigh_cm?.toString() ?? "") : "");
    setArm(loggedToday ? (latest?.arm_cm?.toString() ?? "") : "");
    setOpen(true);
  }

  function save() {
    const n = (v: string) => (v ? Number(v) : null);
    if (!waist && !abdomen && !hip && !thigh && !arm) return;
    startTransition(async () => {
      await logMeasurements(n(waist), n(abdomen), n(hip), n(thigh), n(arm), date);
      setLoggedTodayLocal(true);
      setSavedWaist(n(waist));
      setSavedAbdomen(n(abdomen));
      setSaved(true);
      setOpen(false);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const waistDelta = delta(savedWaist, previous?.waist_cm ?? null);

  return (
    <section className="card p-4">
      <h2 className="font-semibold text-sm mb-1">Medidas corporales</h2>
      <p className="text-xs text-muted mb-2">
        {loggedToday
          ? `Registraste medidas${isToday ? " hoy" : " ese día"} ✓${waistDelta ? ` · Cintura: ${waistDelta}` : ""}`
          : latest
            ? `Última medición: cintura ${latest.waist_cm ?? "—"}cm el ${new Date(latest.log_date + "T00:00:00").toLocaleDateString("es-AR")}.`
            : "Todavía no cargaste medidas."}
      </p>

      {!open ? (
        <button
          onClick={startEditing}
          className="w-full rounded-lg border border-card-border text-xs py-1.5 font-medium hover:border-primary"
        >
          {saved ? "Guardado ✓" : loggedToday ? "Editar" : isToday ? "Registrar medidas de hoy" : "Registrar medidas"}
        </button>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted">{loggedToday ? (isToday ? "Editando hoy" : "Editando este día") : "Nueva medición"}</span>
            <button onClick={() => setShowExtra((v) => !v)} className="text-xs font-medium text-primary">
              {showExtra ? "Menos medidas" : "+ Muslo y brazo"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="text-xs text-muted">{f.label} (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={values[f.key]}
                  onChange={(e) => setters[f.key](e.target.value)}
                  placeholder={f.placeholder}
                  className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            ))}
            {showExtra &&
              EXTRA_FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-muted">{f.label} (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={values[f.key]}
                    onChange={(e) => setters[f.key](e.target.value)}
                    placeholder={f.placeholder}
                    className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              ))}
          </div>
          <button
            onClick={save}
            disabled={isPending || (!waist && !abdomen && !hip && !thigh && !arm)}
            className="mt-3 w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      )}
    </section>
  );
}
