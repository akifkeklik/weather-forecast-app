"use client";

import { useTheme } from "./ThemeProvider";

/** The button names the theme it switches to, not the one already on screen. */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "Açık" : "Koyu";

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={`${next} moda geç`}>
      <span aria-hidden="true">{theme === "dark" ? "☀️" : "🌙"}</span>
      <span>{next} mod</span>
    </button>
  );
}
