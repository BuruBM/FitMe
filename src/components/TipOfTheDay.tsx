import { Lightbulb } from "lucide-react";
import { getTodaysTip } from "@/lib/tips";

export function TipOfTheDay({
  bloatingProne,
  osteopeniaRisk,
  pcos,
}: {
  bloatingProne: boolean;
  osteopeniaRisk: boolean;
  pcos: boolean;
}) {
  const tip = getTodaysTip({ bloatingProne, osteopeniaRisk, pcos });

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
