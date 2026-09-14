"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { MapPin } from "lucide-react";
import { saveCitySelection, searchCitySuggestions } from "@/lib/actions/weather";
import type { GeocodeResult } from "@/lib/weather";
import { IconBadge } from "@/components/IconBadge";

export function CitySettings({ currentCity }: { currentCity: string | null }) {
  const [query, setQuery] = useState(currentCity ?? "");
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const requestId = useRef(0);

  useEffect(() => {
    if (!open || query.trim().length < 2) return;
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await searchCitySuggestions(query);
      if (id === requestId.current) {
        setSuggestions(results);
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, open]);

  const showDropdown = open && query.trim().length >= 2 && (searching || suggestions.length > 0);

  function pick(city: GeocodeResult) {
    setOpen(false);
    setSuggestions([]);
    startTransition(async () => {
      const result = await saveCitySelection(city);
      if (result.ok && result.resolvedName) {
        setQuery(result.resolvedName);
        setStatus("ok");
      } else {
        setStatus("error");
      }
      setTimeout(() => setStatus("idle"), 2500);
    });
  }

  return (
    <section className="card p-4">
      <h2 className="font-semibold text-sm mb-1 flex items-center gap-2">
        <IconBadge icon={<MapPin size={13} />} tint="var(--tint-weather)" color="var(--icon-weather)" size={24} />
        Ciudad
      </h2>
      <p className="text-xs text-muted mb-2">Para mostrar el clima y ver si los días nublados afectan tu ánimo.</p>
      <div className="relative">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Empezá a escribir, ej: Buenos Aires"
          className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        {showDropdown && (
          <ul className="absolute z-10 mt-1 w-full rounded-lg border border-card-border bg-card shadow-lg overflow-hidden">
            {searching && <li className="px-3 py-2 text-xs text-muted">Buscando…</li>}
            {!searching &&
              suggestions.map((s, i) => (
                <li key={`${s.name}-${i}`}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(s)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-background"
                  >
                    {s.name}
                    {(s.admin1 || s.country) && (
                      <span className="text-muted text-xs"> · {[s.admin1, s.country].filter(Boolean).join(", ")}</span>
                    )}
                  </button>
                </li>
              ))}
            {!searching && suggestions.length === 0 && (
              <li className="px-3 py-2 text-xs text-muted">No encontramos esa ciudad.</li>
            )}
          </ul>
        )}
      </div>
      {isPending && <p className="text-xs text-muted mt-1.5">Guardando…</p>}
      {status === "ok" && <p className="text-xs mt-1.5" style={{ color: "var(--primary)" }}>Ciudad guardada ✓</p>}
      {status === "error" && <p className="text-xs text-danger mt-1.5">No pudimos guardar esa ciudad, probá de nuevo.</p>}
    </section>
  );
}
