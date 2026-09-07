import { getFavoriteFoods } from "@/lib/actions/food";
import { getTodaySummary } from "@/lib/queries";
import { FoodLogger } from "@/components/FoodLogger";
import { TodayFoodList } from "@/components/TodayFoodList";

export default async function FoodPage() {
  const [favorites, summary] = await Promise.all([getFavoriteFoods(), getTodaySummary()]);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Comida</h1>
      <FoodLogger favorites={favorites} />
      <TodayFoodList logs={summary.foodLogs} />
    </div>
  );
}
