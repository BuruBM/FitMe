import { TIPS, type Tip } from "@/data/tips";
import { Lightbulb } from "lucide-react";

export function TipOfTheDay({
  bloatingProne,
  osteopeniaRisk,
  pcos,
}: {
  bloatingProne: boolean;
  osteopeniaRisk: boolean;
  pcos: boolean;
}) {
  const relevantCategories: Tip["category"][] = ["proteína", "trabajo", "social", "energía", "sueño"];
  if (bloatingProne) relevantCategories.push("hinchazón", "hinchazón");
  if (osteopeniaRisk) relevantCategories.push("huesos", "huesos");
  if (pcos) relevantCategories.push("hormonas", "hormonas");

  const pool = TIPS.filter((t) => relevantCategories.includes(t.category));
  const dayIndex = new Date().getDate() + new Date().getMonth() * 31;
  const tip = pool[dayIndex % pool.length];

  return (
    <section className="card p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-primary uppercase tracking-wide">
        <Lightbulb size={14} />
        Tip de hoy
      </div>
      <h3 className="font-semibold mt-1.5 text-sm">{tip.title}</h3>
      <p className="text-sm text-muted mt-1">{tip.body}</p>
    </section>
  );
}
