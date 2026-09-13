"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    // Reads browser-only APIs (localStorage, matchMedia) that aren't available during
    // SSR, so the real theme is only known after mount — can't be a lazy useState
    // initializer without risking a hydration mismatch against the server-rendered icon.
    const stored = localStorage.getItem("theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(stored === "light" || stored === "dark" ? stored : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  return (
    <button
      onClick={toggle}
      className="p-1.5 rounded-full text-muted hover:text-foreground"
      aria-label="Cambiar tema claro/oscuro"
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
