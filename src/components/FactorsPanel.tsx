import { FactorsCard } from "@/components/FactorsCard";
import type { HistoryPoint } from "@/lib/queries";

export function FactorsPanel({ history }: { history: HistoryPoint[] }) {
  return (
    <FactorsCard
      title="Factores que afectan tu ánimo"
      history={history}
      scaleMax={5}
      kind="mood"
      emptyHint="Todavía no hay suficiente variación para comparar — necesitás al menos un ánimo cargado y algo de esa variable en dos días distintos."
    />
  );
}
