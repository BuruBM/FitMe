"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Utensils, Dumbbell, LineChart, User } from "lucide-react";

const ITEMS = [
  { href: "/dashboard", label: "Hoy", icon: Home },
  { href: "/food", label: "Comida", icon: Utensils },
  { href: "/workouts", label: "Entreno", icon: Dumbbell },
  { href: "/progress", label: "Progreso", icon: LineChart },
  { href: "/profile", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-card-border z-20">
      <div className="max-w-lg mx-auto grid grid-cols-5">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-xs ${
                active ? "text-primary font-medium" : "text-muted"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
