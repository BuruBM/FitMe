"use client";

import { useState, useTransition } from "react";
import { Pill } from "lucide-react";
import { setPillTaken } from "@/lib/actions/cycle";

export function DayPillToggle({ taken, date }: { taken: boolean | null; date: string }) {
  const [pillTaken, setPillTakenLocal] = useState(taken ?? false);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !pillTaken;
    setPillTakenLocal(next);
    startTransition(() => setPillTaken(next, date));
  }

  return (
    <section className="card p-4">
      <div className="flex items-center gap-2 text-sm font-medium mb-2">
        <Pill size={16} className="text-primary" />
        Pastilla
      </div>
      <button
        onClick={toggle}
        disabled={isPending}
        className={`w-full flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium py-2 border disabled:opacity-50 ${
          pillTaken ? "bg-primary/10 border-primary text-primary" : "border-card-border text-muted"
        }`}
      >
        <Pill size={14} />
        {pillTaken ? "Pastilla tomada ese día" : "Marcar pastilla tomada"}
      </button>
    </section>
  );
}
