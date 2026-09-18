import { computeBloatingFactors } from "@/lib/factors";
import { FactorsCard } from "@/components/FactorsCard";
import type { HistoryPoint } from "@/lib/queries";

export function BloatingFactorsPanel({ history }: { history: HistoryPoint[] }) {
  return (
    <FactorsCard
      title="Qué se relaciona con tu hinchazón"
      history={history}
      scaleMax={3}
      computeFn={computeBloatingFactors}
      emptyHint="Todavía no hay suficiente variación para comparar — necesitás al menos una hinchazón cargada y algo de esa variable en dos días distintos."
    />
  );
}
