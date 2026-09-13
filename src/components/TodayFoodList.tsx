"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteFoodLog } from "@/lib/actions/food";
import type { FoodLog, MealType } from "@/lib/database.types";

const MEAL_LABELS: Record<MealType, string> = {
  desayuno: "Desayuno",
  almuerzo: "Almuerzo",
  merienda: "Merienda",
  cena: "Cena",
  snack: "Snack",
};

const MEAL_ORDER: MealType[] = ["desayuno", "almuerzo", "merienda", "cena", "snack"];

export function TodayFoodList({ logs }: { logs: FoodLog[] }) {
  const [isPending, startTransition] = useTransition();

  if (logs.length === 0) {
    return <p className="text-sm text-muted text-center py-6">Todavía no registraste comidas hoy.</p>;
  }

  const grouped = MEAL_ORDER.map((meal) => ({
    meal,
    items: logs.filter((l) => l.meal_type === meal),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-4">
      {grouped.map(({ meal, items }) => (
        <div key={meal}>
          <h3
            className="text-xs font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: "var(--icon-food)" }}
          >
            {MEAL_LABELS[meal]}
          </h3>
          <div className="card divide-y divide-card-border">
            {items.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-3 py-2.5 text-sm">
                <div>
                  <p className="font-medium">{log.name}</p>
                  <p className="text-xs text-muted">
                    {log.quantity} {log.unit} · {Math.round(log.calories)} kcal · P{Math.round(log.protein_g)}g C
                    {Math.round(log.carbs_g)}g G{Math.round(log.fat_g)}g
                  </p>
                </div>
                <button
                  disabled={isPending}
                  onClick={() => startTransition(() => deleteFoodLog(log.id))}
                  className="text-muted hover:text-danger p-1 disabled:opacity-40"
                  aria-label="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
