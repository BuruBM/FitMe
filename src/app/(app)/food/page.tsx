import { UtensilsCrossed } from "lucide-react";
import { getFavoriteFoods } from "@/lib/actions/food";
import { getHiddenDefaultFoodIds, getRecentFoodLogs, getTodaySummary, getYesterdayFoodLogs } from "@/lib/queries";
import { FoodLogger } from "@/components/FoodLogger";
import { TodayFoodList } from "@/components/TodayFoodList";
import { FoodHistory } from "@/components/FoodHistory";

export default async function FoodPage() {
  const [favorites, summary, history, hiddenDefaultIds, yesterdayLogs] = await Promise.all([
    getFavoriteFoods(),
    getTodaySummary(),
    getRecentFoodLogs(14),
    getHiddenDefaultFoodIds(),
    getYesterdayFoodLogs(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold flex items-center gap-2">
        <UtensilsCrossed size={18} style={{ color: "var(--icon-food)" }} />
        Comida
      </h1>
      <FoodLogger favorites={favorites} hiddenDefaultIds={hiddenDefaultIds} yesterdayLogs={yesterdayLogs} />
      <TodayFoodList logs={summary.foodLogs} />
      <FoodHistory logs={history} />
    </div>
  );
}
