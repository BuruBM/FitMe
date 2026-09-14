"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { resetAllLogs } from "@/lib/actions/account";
import { IconBadge } from "@/components/IconBadge";

export function ResetDataButton() {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function reset() {
    startTransition(async () => {
      await resetAllLogs();
      setConfirming(false);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    });
  }

  return (
    <section className="card p-4 border-l-4" style={{ borderLeftColor: "var(--danger)" }}>
      <h2 className="font-semibold text-sm mb-1 flex items-center gap-2">
        <IconBadge icon={<Trash2 size={13} />} tint="var(--tint-danger)" color="var(--danger)" size={24} />
        Borrar mis registros
      </h2>
      <p className="text-xs text-muted mb-3">
        Borra toda la comida, agua, sueño, peso, entrenamientos, ciclo y check-ins que cargaste — útil para probar
        la app sin dejar datos de prueba en tu historial. Tu perfil, objetivos y preferencias quedan igual.
      </p>
      {confirming ? (
        <div className="space-y-2">
          <p className="text-xs font-medium" style={{ color: "var(--danger)" }}>
            Esto no se puede deshacer. ¿Confirmás?
          </p>
          <div className="flex gap-2">
            <button
              onClick={reset}
              disabled={isPending}
              className="flex-1 rounded-lg text-primary-foreground text-xs font-medium py-2 disabled:opacity-50"
              style={{ background: "var(--danger)" }}
            >
              {isPending ? "Borrando…" : "Sí, borrar todo"}
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
          onClick={() => setConfirming(true)}
          className="w-full rounded-lg border text-xs font-medium py-2"
          style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
        >
          {done ? "Listo, empezaste de cero ✓" : "Borrar todos mis registros"}
        </button>
      )}
    </section>
  );
}
