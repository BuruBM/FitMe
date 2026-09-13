"use client";

import { useState, useTransition } from "react";
import { MapPin } from "lucide-react";
import { updateCity } from "@/lib/actions/weather";

export function CitySettings({ currentCity }: { currentCity: string | null }) {
  const [city, setCity] = useState(currentCity ?? "");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  function save() {
    if (!city.trim()) return;
    startTransition(async () => {
      const result = await updateCity(city.trim());
      if (result.ok && result.resolvedName) {
        setCity(result.resolvedName);
        setStatus("ok");
      } else {
        setStatus("error");
      }
      setTimeout(() => setStatus("idle"), 2500);
    });
  }

  return (
    <section className="card p-4" style={{ background: "var(--tint-weather)" }}>
      <h2 className="font-semibold text-sm mb-1 flex items-center gap-1.5">
        <MapPin size={15} style={{ color: "var(--icon-weather)" }} />
        Ciudad
      </h2>
      <p className="text-xs text-muted mb-2">Para mostrar el clima y ver si los días nublados afectan tu ánimo.</p>
      <div className="flex gap-2">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Ej: Buenos Aires"
          className="flex-1 rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={save}
          disabled={isPending || !city.trim()}
          className="rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 disabled:opacity-50"
        >
          {status === "ok" ? "✓" : "Guardar"}
        </button>
      </div>
      {status === "error" && <p className="text-xs text-danger mt-1.5">No encontramos esa ciudad, probá de nuevo.</p>}
    </section>
  );
}
