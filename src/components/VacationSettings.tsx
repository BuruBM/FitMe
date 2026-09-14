"use client";

import { useState, useTransition } from "react";
import { Palmtree } from "lucide-react";
import { setVacation } from "@/lib/actions/profile";
import { todayInAppTz } from "@/lib/date";
import { IconBadge } from "@/components/IconBadge";

export function VacationSettings({ since, until }: { since: string | null; until: string | null }) {
  const today = todayInAppTz();
  const [vacSince, setVacSince] = useState(since ?? today);
  const [vacUntil, setVacUntil] = useState(until ?? "");
  const [savedSince, setSavedSince] = useState(since);
  const [savedUntil, setSavedUntil] = useState(until);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isActive = savedSince != null && savedUntil != null && today >= savedSince && today <= savedUntil;

  function save() {
    if (!vacUntil) return;
    startTransition(async () => {
      await setVacation(vacSince, vacUntil);
      setSavedSince(vacSince);
      setSavedUntil(vacUntil);
      setEditing(false);
    });
  }

  function end() {
    startTransition(async () => {
      await setVacation(null, null);
      setSavedSince(null);
      setSavedUntil(null);
    });
  }

  return (
    <section className="card p-4">
      <h2 className="font-semibold text-sm mb-1 flex items-center gap-2">
        <IconBadge icon={<Palmtree size={13} />} tint="var(--tint-food)" color="var(--icon-food)" size={24} />
        Vacaciones
      </h2>
      <p className="text-xs text-muted mb-2">
        Mientras estás de vacaciones, no entrenar no te resta puntos de bienestar.
      </p>

      {isActive && !editing && (
        <p className="text-xs mb-2" style={{ color: "var(--primary)" }}>
          Activas hasta el {new Date(savedUntil! + "T00:00:00").toLocaleDateString("es-AR")} ✓
        </p>
      )}

      {editing ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted">Desde</label>
              <input
                type="date"
                value={vacSince}
                onChange={(e) => setVacSince(e.target.value)}
                className="mt-1 w-full rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted">Hasta</label>
              <input
                type="date"
                value={vacUntil}
                min={vacSince}
                onChange={(e) => setVacUntil(e.target.value)}
                className="mt-1 w-full rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={isPending || !vacUntil}
              className="flex-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium py-2 disabled:opacity-50"
            >
              Guardar
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg border border-card-border text-xs px-3 py-2 text-muted"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="flex-1 rounded-lg border border-card-border text-xs font-medium py-2 hover:border-primary"
          >
            {isActive ? "Cambiar fechas" : "Activar vacaciones"}
          </button>
          {isActive && (
            <button
              onClick={end}
              disabled={isPending}
              className="rounded-lg border border-card-border text-xs px-3 py-2 text-muted disabled:opacity-50"
            >
              Terminar ahora
            </button>
          )}
        </div>
      )}
    </section>
  );
}
