import type { SupabaseClient } from "@supabase/supabase-js";
import { todayInAppTz } from "@/lib/date";
import { computeStreak, levelFromXp } from "@/lib/gamification";

/**
 * Shared by every logging action (food/water/sleep/weight/workout/symptom):
 * bumps XP, recomputes the daily streak, and persists it. Badge evaluation
 * happens separately (read path) since it needs aggregate counts.
 */
export async function awardXp(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
) {
  const today = todayInAppTz();

  const { data: state } = await supabase
    .from("gamification_state")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!state) return;

  const newStreak = computeStreak(state.last_activity_date, today, state.current_streak);
  const newXp = state.xp + amount;
  const newLevel = levelFromXp(newXp);
  const longestStreak = Math.max(state.longest_streak, newStreak);

  await supabase
    .from("gamification_state")
    .update({
      xp: newXp,
      level: newLevel,
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_activity_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}
