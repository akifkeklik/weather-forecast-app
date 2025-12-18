"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label="Tema değiştir">
      <span>{theme === "dark" ? "🌙" : "☀️"}</span>
      <span>{theme === "dark" ? "Koyu" : "Açık"} mod</span>
    </button>
  );
}
