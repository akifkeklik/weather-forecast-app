import { describe, expect, it } from "vitest";
import { isWeatherResponse } from "../app/hooks/useWeather";

const valid = {
  city: "Paris",
  temperature: 18,
  weatherText: "açık",
  humidity: 55,
  windSpeed: 12,
  observationTime: "2026-11-27T10:00:00.000Z",
  forecast: [
    { date: "2026-11-28", min: 9, max: 16, weatherText: "bulutlu", condition: "Clouds", precipitationChance: 20 },
  ],
};

describe("isWeatherResponse", () => {
  it("accepts a well-formed response, with or without forecast days", () => {
    expect(isWeatherResponse(valid)).toBe(true);
    expect(isWeatherResponse({ ...valid, forecast: [] })).toBe(true);
  });

  it("rejects a response from before the forecast existed", () => {
    const withoutForecast: Record<string, unknown> = { ...valid };
    delete withoutForecast.forecast;
    expect(isWeatherResponse(withoutForecast)).toBe(false);
  });

  it("rejects malformed forecast days", () => {
    const bad = (day: Record<string, unknown>) =>
      isWeatherResponse({ ...valid, forecast: [{ ...valid.forecast[0], ...day }] });
    expect(bad({ date: "28/11/2026" })).toBe(false);
    expect(bad({ precipitationChance: 120 })).toBe(false);
    expect(bad({ max: Number.NaN })).toBe(false);
  });
});
