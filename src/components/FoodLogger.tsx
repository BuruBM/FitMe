"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Search, Star, Sparkles, Pencil, UtensilsCrossed } from "lucide-react";
import { IconBadge } from "@/components/IconBadge";
import { FOODS, searchLocalFoods, estimateFromText, type FoodItem } from "@/data/foods";
import { logFood } from "@/lib/actions/food";
import type { MealType, CustomFood } from "@/lib/database.types";
import type { OffResult } from "@/app/api/food-search/route";

type Tab = "buscar" | "favoritos" | "texto" | "manual";

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: "desayuno", label: "Desayuno" },
  { value: "almuerzo", label: "Almuerzo" },
  { value: "merienda", label: "Merienda" },
  { value: "cena", label: "Cena" },
  { value: "snack", label: "Snack" },
];

function guessMealType(): MealType {
  const h = new Date().getHours();
  if (h < 10) return "desayuno";
  if (h < 15) return "almuerzo";
  if (h < 19) return "merienda";
  return "cena";
}

interface Base {
  name: string;
  unit: string;
  refQty: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  calcium_mg: number;
  source: "local_db" | "open_food_facts" | "favorite";
}

function fromFoodItem(f: FoodItem): Base {
  return {
    name: f.name,
    unit: f.unit,
    refQty: 1,
    calories: f.calories,
    protein_g: f.protein_g,
    carbs_g: f.carbs_g,
    fat_g: f.fat_g,
    fiber_g: f.fiber_g,
    sodium_mg: f.sodium_mg,
    calcium_mg: f.calcium_mg,
    source: "local_db",
  };
}

function fromOffResult(r: OffResult): Base {
  return {
    name: r.name,
    unit: r.unit,
    refQty: 1,
    calories: r.calories,
    protein_g: r.protein_g,
    carbs_g: r.carbs_g,
    fat_g: r.fat_g,
    fiber_g: r.fiber_g,
    sodium_mg: r.sodium_mg,
    calcium_mg: r.calcium_mg,
    source: "open_food_facts",
  };
}

function fromCustomFood(f: CustomFood): Base {
  return {
    name: f.name,
    unit: f.default_unit,
    refQty: f.default_quantity || 1,
    calories: f.calories,
    protein_g: f.protein_g,
    carbs_g: f.carbs_g,
    fat_g: f.fat_g,
    fiber_g: f.fiber_g,
    sodium_mg: f.sodium_mg,
    calcium_mg: f.calcium_mg,
    source: "favorite",
  };
}

export function FoodLogger({ favorites }: { favorites: CustomFood[] }) {
  const [tab, setTab] = useState<Tab>("buscar");

  return (
    <div className="card p-3">
      <div className="flex items-center gap-2 text-sm font-semibold mb-3 px-0.5">
        <IconBadge icon={<UtensilsCrossed size={14} />} tint="var(--tint-food)" color="var(--icon-food)" size={26} />
        Registrar comida
      </div>
      <div className="grid grid-cols-4 gap-1 mb-3">
        <TabButton active={tab === "buscar"} onClick={() => setTab("buscar")} icon={<Search size={14} />} label="Buscar" />
        <TabButton active={tab === "favoritos"} onClick={() => setTab("favoritos")} icon={<Star size={14} />} label="Favoritos" />
        <TabButton active={tab === "texto"} onClick={() => setTab("texto")} icon={<Sparkles size={14} />} label="Texto" />
        <TabButton active={tab === "manual"} onClick={() => setTab("manual")} icon={<Pencil size={14} />} label="Manual" />
      </div>

      {tab === "buscar" && <SearchTab />}
      {tab === "favoritos" && <FavoritesTab favorites={favorites} />}
      {tab === "texto" && <TextTab />}
      {tab === "manual" && <ManualTab />}
      <GlobalStyles />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium ${
        active ? "bg-primary text-primary-foreground" : "text-muted"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SearchTab() {
  const [query, setQuery] = useState("");
  const [offResults, setOffResults] = useState<OffResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Base | null>(null);

  const localResults = useMemo(() => (query ? searchLocalFoods(query) : FOODS.filter((f) => f.favoriteFor)), [query]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim().length < 3) {
        setOffResults([]);
        return;
      }
      setLoading(true);
      fetch(`/api/food-search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((d) => setOffResults(d.results ?? []))
        .catch(() => setOffResults([]))
        .finally(() => setLoading(false));
    }, 450);
    return () => clearTimeout(t);
  }, [query]);

  if (selected) return <AddItemPanel base={selected} onDone={() => setSelected(null)} />;

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscá un alimento, ej: tofu, milanesa de soja..."
        className="input"
      />
      {!query && <p className="text-xs text-muted">Sugeridos para vos:</p>}
      <div className="space-y-1.5 max-h-80 overflow-y-auto">
        {localResults.map((f) => (
          <FoodResultRow
            key={f.id}
            name={f.name}
            meta={`${Math.round(f.calories)} kcal · P${f.protein_g}g`}
            note={f.favoriteFor}
            onClick={() => setSelected(fromFoodItem(f))}
          />
        ))}
        {loading && <p className="text-xs text-muted px-1">Buscando en Open Food Facts...</p>}
        {offResults.length > 0 && (
          <>
            <p className="text-xs text-muted px-1 pt-1">Open Food Facts:</p>
            {offResults.map((r) => (
              <FoodResultRow
                key={r.id}
                name={r.name}
                meta={`${r.calories} kcal /100g · P${r.protein_g}g`}
                onClick={() => setSelected(fromOffResult(r))}
              />
            ))}
          </>
        )}
        {query && !loading && localResults.length === 0 && offResults.length === 0 && (
          <p className="text-sm text-muted text-center py-4">
            No encontramos nada. Probá la pestaña &quot;Manual&quot;.
          </p>
        )}
      </div>
    </div>
  );
}

function FavoritesTab({ favorites }: { favorites: CustomFood[] }) {
  const [selected, setSelected] = useState<Base | null>(null);
  const starred = FOODS.filter((f) => f.favoriteFor);

  if (selected) return <AddItemPanel base={selected} onDone={() => setSelected(null)} />;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-muted mb-1.5">Tus proteínas preferidas</p>
        <div className="space-y-1.5">
          {starred.map((f) => (
            <FoodResultRow
              key={f.id}
              name={f.name}
              meta={`${Math.round(f.calories)} kcal · P${f.protein_g}g`}
              onClick={() => setSelected(fromFoodItem(f))}
            />
          ))}
        </div>
      </div>
      {favorites.length > 0 && (
        <div>
          <p className="text-xs text-muted mb-1.5">Guardados por vos</p>
          <div className="space-y-1.5">
            {favorites.map((f) => (
              <FoodResultRow
                key={f.id}
                name={f.name}
                meta={`${Math.round(f.calories)} kcal · P${f.protein_g}g`}
                onClick={() => setSelected(fromCustomFood(f))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FoodResultRow({
  name,
  meta,
  note,
  onClick,
}: {
  name: string;
  meta: string;
  note?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-card-border px-3 py-2 hover:border-primary transition"
    >
      <p className="text-sm font-medium">{name}</p>
      <p className="text-xs text-muted">
        {meta}
        {note ? ` · ${note}` : ""}
      </p>
    </button>
  );
}

function SaltShortcut({ label, mg, onPick }: { label: string; mg: number; onPick: (v: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(String(mg))}
      className="flex-1 text-[11px] rounded-md border border-card-border py-1.5 text-muted hover:border-primary"
    >
      {label}
    </button>
  );
}

function AddItemPanel({ base, onDone }: { base: Base; onDone: () => void }) {
  const [multiplier, setMultiplier] = useState(1);
  const [mealType, setMealType] = useState<MealType>(guessMealType());
  const [isPending, startTransition] = useTransition();

  const scaled = {
    calories: base.calories * multiplier,
    protein_g: base.protein_g * multiplier,
    carbs_g: base.carbs_g * multiplier,
    fat_g: base.fat_g * multiplier,
    fiber_g: base.fiber_g * multiplier,
    sodium_mg: base.sodium_mg * multiplier,
    calcium_mg: base.calcium_mg * multiplier,
  };

  function add() {
    startTransition(async () => {
      await logFood({
        mealType,
        name: base.name,
        quantity: Number((base.refQty * multiplier).toFixed(1)),
        unit: base.unit,
        calories: Math.round(scaled.calories),
        proteinG: Math.round(scaled.protein_g * 10) / 10,
        carbsG: Math.round(scaled.carbs_g * 10) / 10,
        fatG: Math.round(scaled.fat_g * 10) / 10,
        fiberG: Math.round(scaled.fiber_g * 10) / 10,
        sodiumMg: Math.round(scaled.sodium_mg),
        calciumMg: Math.round(scaled.calcium_mg),
        source: base.source,
      });
      onDone();
    });
  }

  return (
    <div className="space-y-3">
      <button onClick={onDone} className="text-xs text-muted">
        ← Volver
      </button>
      <p className="font-medium text-sm">{base.name}</p>

      <div>
        <label className="text-xs text-muted">Cantidad ({base.unit})</label>
        <div className="flex items-center gap-2 mt-1">
          <button onClick={() => setMultiplier((m) => Math.max(0.25, m - 0.25))} className="stepper">
            −
          </button>
          <span className="w-14 text-center text-sm font-medium">{multiplier}x</span>
          <button onClick={() => setMultiplier((m) => m + 0.25)} className="stepper">
            +
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs text-muted">Comida</label>
        <select value={mealType} onChange={(e) => setMealType(e.target.value as MealType)} className="input mt-1">
          {MEAL_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg bg-background border border-card-border px-3 py-2 text-xs grid grid-cols-2 gap-y-1">
        <span>Calorías: {Math.round(scaled.calories)} kcal</span>
        <span>Proteína: {scaled.protein_g.toFixed(1)}g</span>
        <span>Carbs: {scaled.carbs_g.toFixed(1)}g</span>
        <span>Grasas: {scaled.fat_g.toFixed(1)}g</span>
        <span>Sodio: {Math.round(scaled.sodium_mg)}mg</span>
        <span>Calcio: {Math.round(scaled.calcium_mg)}mg</span>
      </div>

      <button onClick={add} disabled={isPending} className="btn-primary">
        {isPending ? "Agregando..." : "Agregar"}
      </button>

    </div>
  );
}

function TextTab() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ matched: FoodItem[]; unmatched: string[] } | null>(null);
  const [selected, setSelected] = useState<Base | null>(null);

  if (selected) return <AddItemPanel base={selected} onDone={() => setSelected(null)} />;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Escribí lo que comiste, separado por &quot;y&quot; o comas. Ej: &quot;milanesa de soja, ensalada y arroz&quot;.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="input"
        placeholder="milanesa de soja con ensalada y arroz integral"
      />
      <button
        onClick={() => setResult(estimateFromText(text))}
        disabled={!text.trim()}
        className="btn-primary disabled:opacity-50"
      >
        Estimar
      </button>

      {result && (
        <div className="space-y-2 pt-2 border-t border-card-border">
          {result.matched.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted">Encontrado, tocá para agregar:</p>
              {result.matched.map((f) => (
                <FoodResultRow
                  key={f.id}
                  name={f.name}
                  meta={`${Math.round(f.calories)} kcal · P${f.protein_g}g`}
                  onClick={() => setSelected(fromFoodItem(f))}
                />
              ))}
            </div>
          )}
          {result.unmatched.length > 0 && (
            <p className="text-xs text-muted">
              No encontramos: <em>{result.unmatched.join(", ")}</em>. Usá la pestaña &quot;Manual&quot; para
              cargarlos.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ManualTab() {
  const [mealType, setMealType] = useState<MealType>(guessMealType());
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("porción");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [sodium, setSodium] = useState("");
  const [saveAsFavorite, setSaveAsFavorite] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!name || !calories) return;
    startTransition(async () => {
      await logFood({
        mealType,
        name,
        quantity,
        unit,
        calories: Number(calories) || 0,
        proteinG: Number(protein) || 0,
        carbsG: Number(carbs) || 0,
        fatG: Number(fat) || 0,
        fiberG: 0,
        sodiumMg: Number(sodium) || 0,
        calciumMg: 0,
        source: "manual",
        saveAsFavorite,
      });
      setName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setSodium("");
    });
  }

  return (
    <div className="space-y-2.5">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del alimento" className="input" />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          placeholder="Cantidad"
          className="input"
        />
        <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unidad" className="input" />
      </div>
      <input
        type="number"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
        placeholder="Calorías (kcal)"
        className="input"
      />
      <div className="grid grid-cols-3 gap-2">
        <input
          type="number"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          placeholder="Prot (g)"
          className="input"
        />
        <input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="Carb (g)" className="input" />
        <input type="number" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="Grasa (g)" className="input" />
      </div>
      <div>
        <input
          type="number"
          value={sodium}
          onChange={(e) => setSodium(e.target.value)}
          placeholder="Sodio (mg) — si no lo sabés, usá un atajo"
          className="input"
        />
        <div className="flex gap-1.5 mt-1.5">
          <SaltShortcut label="Bajo en sal" mg={200} onPick={setSodium} />
          <SaltShortcut label="Medio" mg={600} onPick={setSodium} />
          <SaltShortcut label="Alto en sal" mg={1200} onPick={setSodium} />
        </div>
        <p className="text-[11px] text-muted mt-1">
          Si no cocinaste vos (delivery, de paquete, comida de otra persona), es normal no saber el sodio exacto:
          usá el atajo como estimación aproximada.
        </p>
      </div>
      <select value={mealType} onChange={(e) => setMealType(e.target.value as MealType)} className="input">
        {MEAL_OPTIONS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={saveAsFavorite} onChange={(e) => setSaveAsFavorite(e.target.checked)} />
        Guardar como favorito para la próxima
      </label>
      <button onClick={submit} disabled={isPending || !name || !calories} className="btn-primary disabled:opacity-50">
        {isPending ? "Agregando..." : "Agregar"}
      </button>
    </div>
  );
}

function GlobalStyles() {
  return (
    <style jsx global>{`
      .input {
        width: 100%;
        border-radius: 0.5rem;
        border: 1px solid var(--card-border);
        background: var(--background);
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        outline: none;
      }
      .input:focus {
        border-color: var(--primary);
      }
      .btn-primary {
        width: 100%;
        border-radius: 0.5rem;
        background: var(--primary);
        color: var(--primary-foreground);
        font-weight: 500;
        padding: 0.625rem;
        font-size: 0.875rem;
      }
      .stepper {
        width: 2rem;
        height: 2rem;
        border-radius: 9999px;
        border: 1px solid var(--card-border);
        font-size: 1.1rem;
        line-height: 1;
      }
    `}</style>
  );
}
