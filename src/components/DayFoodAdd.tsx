"use client";

import { useState, useTransition } from "react";
import { UtensilsCrossed } from "lucide-react";
import { logFood } from "@/lib/actions/food";
import { searchLocalFoods, type FoodItem } from "@/data/foods";
import type { MealType } from "@/lib/database.types";

const MEAL_LABELS: Record<MealType, string> = {
  desayuno: "Desayuno",
  almuerzo: "Almuerzo",
  merienda: "Merienda",
  cena: "Cena",
  snack: "Snack",
};
const MEAL_ORDER: MealType[] = ["desayuno", "almuerzo", "merienda", "cena", "snack"];

export function DayFoodAdd({ date, onAdded }: { date: string; onAdded?: () => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [multiplier, setMultiplier] = useState("1");
  const [mealType, setMealType] = useState<MealType>("desayuno");
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);

  const results = query.trim() ? searchLocalFoods(query) : [];
  const qty = Number(multiplier) || 0;

  function pick(item: FoodItem) {
    setSelected(item);
    setMultiplier("1");
  }

  function add() {
    if (!selected || qty <= 0) return;
    startTransition(async () => {
      await logFood(
        {
          mealType,
          name: selected.name,
          quantity: Math.round(selected.quantity * qty * 10) / 10,
          unit: selected.unit,
          calories: Math.round(selected.calories * qty),
          proteinG: Math.round(selected.protein_g * qty * 10) / 10,
          carbsG: Math.round(selected.carbs_g * qty * 10) / 10,
          fatG: Math.round(selected.fat_g * qty * 10) / 10,
          fiberG: Math.round(selected.fiber_g * qty * 10) / 10,
          sodiumMg: Math.round(selected.sodium_mg * qty),
          calciumMg: Math.round(selected.calcium_mg * qty),
          source: "local_db",
        },
        date,
      );
      setSelected(null);
      setQuery("");
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
      onAdded?.();
    });
  }

  return (
    <section className="card p-4">
      <div className="flex items-center gap-1.5 text-sm font-semibold mb-2">
        <UtensilsCrossed size={15} style={{ color: "var(--icon-food)" }} />
        Agregar comida
      </div>

      {!selected ? (
        <>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar un alimento..."
            className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {results.length > 0 && (
            <div className="mt-2 space-y-1 max-h-56 overflow-y-auto">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => pick(item)}
                  className="w-full text-left rounded-lg border border-card-border px-3 py-2 text-xs hover:border-primary"
                >
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted mt-0.5">
                    {item.unit} ≈ {item.quantity}g · {Math.round(item.calories)} kcal
                  </p>
                </button>
              ))}
            </div>
          )}
          {justAdded && <p className="text-xs text-primary font-medium mt-2">Agregado ✓</p>}
        </>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium">{selected.name}</p>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted">
              Cantidad (x{selected.unit} ≈ {selected.quantity}g)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={multiplier}
              onChange={(e) => setMultiplier(e.target.value)}
              className="w-20 rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <p className="text-xs text-muted">
            ≈ {Math.round(selected.quantity * qty)}g en total · {Math.round(selected.calories * qty)} kcal · P
            {Math.round(selected.protein_g * qty * 10) / 10}g
          </p>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
          >
            {MEAL_ORDER.map((m) => (
              <option key={m} value={m}>
                {MEAL_LABELS[m]}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={add}
              disabled={isPending || qty <= 0}
              className="flex-1 rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 disabled:opacity-50"
            >
              Agregar
            </button>
            <button
              onClick={() => setSelected(null)}
              className="rounded-lg border border-card-border text-sm px-4 py-2 text-muted"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
