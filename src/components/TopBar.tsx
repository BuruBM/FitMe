import { Flame } from "lucide-react";
import { levelFromXp, xpProgressInLevel } from "@/lib/gamification";
import type { GamificationState } from "@/lib/database.types";

export function TopBar({ name, state }: { name: string | null; state: GamificationState | null }) {
  const xp = state?.xp ?? 0;
  const level = state ? levelFromXp(xp) : 1;
  const progress = xpProgressInLevel(xp);
  const streak = state?.current_streak ?? 0;

  return (
    <header className="sticky top-0 z-10 bg-card/90 backdrop-blur border-b border-card-border">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">Hola{name ? `, ${name.split(" ")[0]}` : ""}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-semibold">Nivel {level}</span>
            <div className="w-20 h-1.5 rounded-full bg-card-border overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${progress.pct}%` }} />
            </div>
          </div>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 text-accent font-medium text-sm">
            <Flame size={18} />
            {streak}
          </div>
        )}
      </div>
    </header>
  );
}
