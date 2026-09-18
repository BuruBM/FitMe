import { TIPS, type Tip } from "@/data/tips";

export interface TipFlags {
  bloatingProne: boolean;
  osteopeniaRisk: boolean;
  pcos: boolean;
}

// Deterministic per calendar day, so the inline "Tip de hoy" card and the
// popup (when nothing else needs celebrating) always agree on which tip.
export function getTodaysTip(flags: TipFlags): Tip {
  const relevantCategories: Tip["category"][] = ["proteína", "trabajo", "social", "energía", "sueño", "hábitos", "hábitos"];
  if (flags.bloatingProne) relevantCategories.push("hinchazón", "hinchazón");
  if (flags.osteopeniaRisk) relevantCategories.push("huesos", "huesos");
  if (flags.pcos) relevantCategories.push("hormonas", "hormonas");

  const pool = TIPS.filter((t) => relevantCategories.includes(t.category));
  const dayIndex = new Date().getDate() + new Date().getMonth() * 31;
  return pool[dayIndex % pool.length];
}
