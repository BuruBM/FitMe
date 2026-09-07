"use client";

import { useEffect, useState } from "react";
import { BADGES } from "@/lib/gamification";

export function BadgeToast({ badgeIds }: { badgeIds: string[] }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, []);

  if (!visible || badgeIds.length === 0) return null;

  const badges = badgeIds.map((id) => BADGES.find((b) => b.id === id)).filter(Boolean);

  return (
    <div className="fixed bottom-20 inset-x-0 z-30 flex justify-center px-4">
      <div className="card px-4 py-3 shadow-lg flex flex-col gap-1 max-w-sm w-full">
        {badges.map((b) => (
          <div key={b!.id} className="flex items-center gap-2 text-sm">
            <span className="text-xl">{b!.icon}</span>
            <div>
              <p className="font-medium">¡Nuevo logro: {b!.title}!</p>
              <p className="text-muted text-xs">{b!.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
