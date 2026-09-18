"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface CelebrationItem {
  icon: string;
  title: string;
  body: string;
}

interface BadgeInfo {
  icon: string;
  title: string;
  description: string;
}

// Centered, must-close popup for anything worth celebrating — a level-up,
// a new badge, or (when there's nothing else to celebrate) today's tip, so
// it reaches her instead of depending on her scrolling down to find it.
// Deliberately not dismissible by tapping the backdrop: she asked for
// something she has to actually close, not something she can miss.
export function CelebrationModal({
  badges,
  leveledUpTo,
  tip,
}: {
  badges: BadgeInfo[];
  leveledUpTo: number | null;
  tip: { title: string; body: string } | null;
}) {
  const [queue, setQueue] = useState<CelebrationItem[] | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const items: CelebrationItem[] = [];
    if (leveledUpTo != null) {
      items.push({
        icon: "🎉",
        title: `¡Subiste al nivel ${leveledUpTo}!`,
        body: "Seguís sumando constancia en La Marea.",
      });
    }
    for (const b of badges) {
      items.push({ icon: b.icon, title: `¡Nuevo logro: ${b.title}!`, body: b.description });
    }

    if (items.length === 0 && tip) {
      const today = new Date().toISOString().slice(0, 10);
      let shownDate: string | null = null;
      try {
        shownDate = localStorage.getItem("tipPopupShownDate");
      } catch {
        // ignore — private browsing / blocked storage
      }
      if (shownDate !== today) {
        items.push({ icon: "💡", title: tip.title, body: tip.body });
        try {
          localStorage.setItem("tipPopupShownDate", today);
        } catch {
          // ignore
        }
      }
    }

    // Only computed once per mount, same as the celebration it replaces —
    // it's a one-shot "what's new this load" check against localStorage
    // (an external system), not state derivable during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQueue(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!queue || queue.length === 0 || index >= queue.length) return null;
  const item = queue[index];
  const isLast = index + 1 >= queue.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
      <div className="card w-full max-w-sm p-6 text-center relative">
        <button
          onClick={() => setIndex((i) => i + 1)}
          aria-label="Cerrar"
          className="absolute top-3 right-3 text-muted p-1"
        >
          <X size={18} />
        </button>
        <div className="text-4xl">{item.icon}</div>
        <h2 className="font-semibold text-lg mt-2">{item.title}</h2>
        <p className="text-sm text-muted mt-2">{item.body}</p>
        <button
          onClick={() => setIndex((i) => i + 1)}
          className="mt-4 w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2"
        >
          {isLast ? "Genial" : "Siguiente"}
        </button>
      </div>
    </div>
  );
}
