"use client";

import { useState, useTransition } from "react";
import { Trash2, Pencil } from "lucide-react";
import { deleteFoodLog, updateFoodLog } from "@/lib/actions/food";
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
  const [editingId, setEditingId] = useState<string | null>(null);

  if (logs.length === 0) {
    return <p className="text-sm text-muted text-center py-6">Todavía no hay comidas registradas este día.</p>;
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
            {items.map((log) =>
              editingId === log.id ? (
                <EditFoodLogRow key={log.id} log={log} onDone={() => setEditingId(null)} />
              ) : (
                <FoodLogRow key={log.id} log={log} onEdit={() => setEditingId(log.id)} />
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function FoodLogRow({ log, onEdit }: { log: FoodLog; onEdit: () => void }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between px-3 py-2.5 text-sm">
      <div>
        <p className="font-medium">{log.name}</p>
        <p className="text-xs text-muted">
          {log.quantity} {log.unit} · {Math.round(log.calories)} kcal · P{Math.round(log.protein_g)}g C
          {Math.round(log.carbs_g)}g G{Math.round(log.fat_g)}g
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onEdit} className="text-muted hover:text-primary p-1" aria-label="Editar">
          <Pencil size={15} />
        </button>
        <button
          disabled={isPending}
          onClick={() => startTransition(() => deleteFoodLog(log.id))}
          className="text-muted hover:text-danger p-1 disabled:opacity-40"
          aria-label="Eliminar"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function EditFoodLogRow({ log, onDone }: { log: FoodLog; onDone: () => void }) {
  const [quantityInput, setQuantityInput] = useState(String(log.quantity));
  const [mealType, setMealType] = useState<MealType>(log.meal_type);
  const [isPending, startTransition] = useTransition();

  const quantity = Number(quantityInput) || 0;
  const ratio = log.quantity > 0 ? quantity / log.quantity : 1;

  function save() {
    if (quantity <= 0) return;
    startTransition(async () => {
      await updateFoodLog(log.id, quantity, mealType);
      onDone();
    });
  }

  return (
    <div className="px-3 py-2.5 text-sm space-y-2">
      <p className="font-medium">{log.name}</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="0.1"
          min="0"
          value={quantityInput}
          onChange={(e) => setQuantityInput(e.target.value)}
          className="w-20 rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
        />
        <span className="text-xs text-muted">{log.unit}</span>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType)}
          className="flex-1 rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
        >
          {MEAL_ORDER.map((m) => (
            <option key={m} value={m}>
              {MEAL_LABELS[m]}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-muted">
        {Math.round(log.calories * ratio)} kcal · P{Math.round(log.protein_g * ratio * 10) / 10}g C
        {Math.round(log.carbs_g * ratio * 10) / 10}g G{Math.round(log.fat_g * ratio * 10) / 10}g
      </p>
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={isPending || quantity <= 0}
          className="flex-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium py-1.5 disabled:opacity-50"
        >
          Guardar
        </button>
        <button onClick={onDone} className="rounded-lg border border-card-border text-xs px-3 py-1.5 text-muted">
          Cancelar
        </button>
      </div>
    </div>
  );
}
