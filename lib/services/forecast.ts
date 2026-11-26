import type { DailyForecast } from "../types/weather";

/** One 3-hour slot from the provider, already validated. */
export interface ForecastSlot {
  /** Unix seconds (UTC). */
  dt: number;
  min: number;
  max: number;
  /** 0–1. */
  pop: number;
  weatherText: string;
  condition: string;
}

/** A day needs this many 3-hour slots (12 hours) before its min and max mean anything. */
export const MIN_SLOTS_PER_DAY = 4;

function localDate(unixSeconds: number, offsetSeconds: number): string {
  return new Date((unixSeconds + offsetSeconds) * 1000).toISOString().slice(0, 10);
}

function localHour(unixSeconds: number, offsetSeconds: number): number {
  return new Date((unixSeconds + offsetSeconds) * 1000).getUTCHours();
}

/**
 * Groups 3-hour slots into days in the city's time zone.
 * Today is skipped (the current-weather card covers it), as are partial days at the end of the window.
 * The day's description comes from the slot closest to local noon.
 */
export function toDailyForecast(
  slots: ForecastSlot[],
  offsetSeconds: number,
  nowSeconds: number,
  days = 5
): DailyForecast[] {
  const today = localDate(nowSeconds, offsetSeconds);
  const byDay = new Map<string, ForecastSlot[]>();

  for (const slot of slots) {
    const date = localDate(slot.dt, offsetSeconds);
    if (date <= today) continue;
    const list = byDay.get(date);
    if (list) list.push(slot);
    else byDay.set(date, [slot]);
  }

  return [...byDay.entries()]
    .filter(([, list]) => list.length >= MIN_SLOTS_PER_DAY)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, days)
    .map(([date, list]) => {
      const noon = list.reduce((best, slot) =>
        Math.abs(localHour(slot.dt, offsetSeconds) - 12) <
        Math.abs(localHour(best.dt, offsetSeconds) - 12)
          ? slot
          : best
      );
      return {
        date,
        min: Math.round(Math.min(...list.map((s) => s.min))),
        max: Math.round(Math.max(...list.map((s) => s.max))),
        weatherText: noon.weatherText,
        condition: noon.condition,
        precipitationChance: Math.round(Math.max(...list.map((s) => s.pop)) * 100),
      };
    });
}
