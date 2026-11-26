import { describe, expect, it } from "vitest";
import { toDailyForecast, type ForecastSlot } from "../lib/services/forecast";

const H = 3600;
// 2026-11-27 00:00 UTC
const DAY0 = Date.UTC(2026, 10, 27) / 1000;

function slot(hoursFromDay0: number, over: Partial<ForecastSlot> = {}): ForecastSlot {
  return {
    dt: DAY0 + hoursFromDay0 * H,
    min: 10,
    max: 15,
    pop: 0,
    weatherText: "açık",
    condition: "Clear",
    ...over,
  };
}

/** Eight 3-hour slots per day for `days` days, starting at day0 00:00 UTC. */
function fullDays(days: number): ForecastSlot[] {
  return Array.from({ length: days * 8 }, (_, i) => slot(i * 3));
}

describe("toDailyForecast", () => {
  it("skips today and returns at most five whole days in order", () => {
    const days = toDailyForecast(fullDays(7), 0, DAY0 + 10 * H);
    expect(days.map((d) => d.date)).toEqual([
      "2026-11-28",
      "2026-11-29",
      "2026-11-30",
      "2026-12-01",
      "2026-12-02",
    ]);
  });

  it("takes the lowest minimum, highest maximum and highest precipitation chance of the day", () => {
    const slots = [
      slot(24, { min: 4.6, max: 9 }),
      slot(27, { min: 7, max: 12, pop: 0.35 }),
      slot(30, { min: 8, max: 16.4 }),
      slot(33, { min: 6, max: 11, pop: 0.8 }),
    ];
    const [day] = toDailyForecast(slots, 0, DAY0);
    expect(day).toMatchObject({ date: "2026-11-28", min: 5, max: 16, precipitationChance: 80 });
  });

  it("describes the day by the slot closest to local noon", () => {
    const slots = [
      slot(24, { weatherText: "sis", condition: "Mist" }),
      slot(27, { weatherText: "bulutlu", condition: "Clouds" }),
      slot(36, { weatherText: "yağmur", condition: "Rain" }),
      slot(45, { weatherText: "açık", condition: "Clear" }),
    ];
    expect(toDailyForecast(slots, 0, DAY0)[0]).toMatchObject({ weatherText: "yağmur", condition: "Rain" });
  });

  it("groups slots by the city's own calendar day, not UTC", () => {
    // UTC+9: 21:00 UTC on the 27th is already 06:00 on the 28th in Tokyo.
    const slots = [21, 24, 27, 30].map((h) => slot(h));
    const days = toDailyForecast(slots, 9 * H, DAY0);
    expect(days).toHaveLength(1);
    expect(days[0].date).toBe("2026-11-28");
  });

  it("drops a partial day with fewer than four slots rather than show a misleading range", () => {
    const slots = [...fullDays(2), slot(48), slot(51)];
    expect(toDailyForecast(slots, 0, DAY0).map((d) => d.date)).toEqual(["2026-11-28"]);
  });

  it("returns nothing for no slots", () => {
    expect(toDailyForecast([], 0, DAY0)).toEqual([]);
  });
});
