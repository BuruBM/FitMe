"use client";

import { useState, useTransition } from "react";
import { logSymptoms } from "@/lib/actions/tracking";
import type { SymptomLog } from "@/lib/database.types";

const BLOATING_LABELS = ["Nada", "Leve", "Moderado", "Mucho"];
const VALENCE_OPTIONS = [
  { value: -2, emoji: "😣", label: "Muy negativo" },
  { value: -1, emoji: "🙁", label: "Negativo" },
  { value: 0, emoji: "😐", label: "Neutro" },
  { value: 1, emoji: "🙂", label: "Positivo" },
  { value: 2, emoji: "😄", label: "Muy positivo" },
];

export function SymptomQuickLog({ existing }: { existing: SymptomLog | null }) {
  const [loggedToday, setLoggedToday] = useState(existing != null);
  const [open, setOpen] = useState(false);
  const [bloating, setBloating] = useState<number | null>(existing?.bloating ?? null);
  const [energy, setEnergy] = useState<number | null>(existing?.energy ?? null);
  const [mood, setMood] = useState<number | null>(existing?.mood ?? null);
  const [irritability, setIrritability] = useState<number | null>(existing?.irritability ?? null);
  const [sensitivityLevel, setSensitivityLevel] = useState<number | null>(existing?.sensitivity_level ?? null);
  const [alcoholUnits, setAlcoholUnits] = useState(existing?.alcohol_units ?? 0);
  const [tobaccoUsed, setTobaccoUsed] = useState(existing?.tobacco_used ?? false);
  const [socialMediaMinutes, setSocialMediaMinutes] = useState(existing?.social_media_minutes ?? 0);
  const [socialContact, setSocialContact] = useState<number | null>(existing?.social_contact ?? null);
  const [stressLevel, setStressLevel] = useState<number | null>(existing?.stress_level ?? null);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [notesValence, setNotesValence] = useState<number | null>(existing?.notes_valence ?? null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const hasAnyValue =
    [bloating, energy, mood, irritability, sensitivityLevel, stressLevel, socialContact].some((v) => v != null) ||
    alcoholUnits > 0 ||
    tobaccoUsed ||
    socialMediaMinutes > 0 ||
    notes.trim().length > 0;

  function save() {
    startTransition(async () => {
      await logSymptoms({
        bloating,
        energy,
        mood,
        irritability,
        sensitivityLevel,
        alcoholUnits,
        tobaccoUsed,
        socialMediaMinutes,
        socialContact,
        stressLevel,
        notesValence: notesValence ?? undefined,
        notes: notes || undefined,
      });
      setSaved(true);
      setLoggedToday(true);
      setOpen(false);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  if (!open) {
    return (
      <section className="card p-4">
        <h2 className="font-semibold text-sm mb-1">¿Cómo te sentís hoy?</h2>
        <p className="text-xs text-muted mb-2">
          {saved
            ? "Guardado ✓"
            : loggedToday
              ? "Ya completaste tu check-in de hoy ✓ — podés editarlo si cambió algo."
              : "Todavía no cargaste cómo te sentís hoy."}
        </p>
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-lg border border-card-border text-xs py-1.5 font-medium hover:border-primary"
        >
          {loggedToday ? "Editar" : "Completar"}
        </button>
      </section>
    );
  }

  return (
    <section className="card p-4 space-y-3">
      <h2 className="font-semibold text-sm">¿Cómo te sentís hoy?</h2>

      <div>
        <p className="text-xs font-medium text-foreground/85 mb-1.5">Hinchazón</p>
        <div className="flex gap-1.5">
          {BLOATING_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => setBloating(i)}
              className={`flex-1 text-xs rounded-md py-1.5 border ${
                bloating === i ? "bg-primary text-primary-foreground border-primary" : "border-card-border text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <RatingRow label="Energía" value={energy} onChange={setEnergy} />
      <RatingRow label="Ánimo" value={mood} onChange={setMood} />
      <RatingRow label="Irritabilidad" value={irritability} onChange={setIrritability} />
      <RatingRow label="Sensibilidad (te afecta más de lo normal)" value={sensitivityLevel} onChange={setSensitivityLevel} />
      <RatingRow label="Estrés" value={stressLevel} onChange={setStressLevel} />
      <RatingRow label="Contacto con gente querida" value={socialContact} onChange={setSocialContact} max={5} min={0} />

      <div className="grid grid-cols-2 gap-2 pt-1">
        <div>
          <p className="text-xs font-medium text-foreground/85 mb-1.5">Tragos de alcohol</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setAlcoholUnits((n) => Math.max(0, n - 1))} className="stepper" type="button">
              −
            </button>
            <span className="w-6 text-center text-sm font-medium">{alcoholUnits}</span>
            <button onClick={() => setAlcoholUnits((n) => n + 1)} className="stepper" type="button">
              +
            </button>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-foreground/85 mb-1.5">Tabaco</p>
          <button
            onClick={() => setTobaccoUsed((v) => !v)}
            className={`w-full text-xs rounded-md py-1.5 border ${
              tobaccoUsed ? "bg-primary text-primary-foreground border-primary" : "border-card-border text-muted"
            }`}
          >
            {tobaccoUsed ? "Fumé hoy" : "No fumé"}
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-foreground/85 mb-1.5">Minutos en redes sociales (aprox.)</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setSocialMediaMinutes((n) => Math.max(0, n - 15))} className="stepper" type="button">
            −
          </button>
          <span className="flex-1 text-center text-sm font-medium">{socialMediaMinutes} min</span>
          <button onClick={() => setSocialMediaMinutes((n) => n + 15)} className="stepper" type="button">
            +
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-foreground/85 mb-1.5">¿Algo para aclarar? (opcional)</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Ej: discusión con mi jefe, mal día en el trabajo..."
          className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        {notes && (
          <div className="mt-2">
            <p className="text-[11px] text-muted mb-1">¿Cómo te afectó anímicamente esa nota?</p>
            <div className="flex gap-1.5">
              {VALENCE_OPTIONS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  title={v.label}
                  onClick={() => setNotesValence(v.value)}
                  className={`flex-1 text-lg rounded-md py-1 border ${
                    notesValence === v.value ? "bg-primary/10 border-primary" : "border-card-border"
                  }`}
                >
                  {v.emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={isPending || !hasAnyValue}
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

      <style jsx global>{`
        .stepper {
          width: 2rem;
          height: 2rem;
          border-radius: 9999px;
          border: 1px solid var(--card-border);
          font-size: 1.1rem;
          line-height: 1;
        }
      `}</style>
    </section>
  );
}

function RatingRow({
  label,
  value,
  onChange,
  min = 1,
  max = 5,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div>
      <p className="text-xs font-medium text-foreground/85 mb-1.5">{label}</p>
      <div className="flex gap-1.5">
        {options.map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 text-xs rounded-md py-1.5 border ${
              value === n ? "bg-primary text-primary-foreground border-primary" : "border-card-border text-muted"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
