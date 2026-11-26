import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentWeather, WeatherResponse } from "../lib/types/weather";

vi.mock("../lib/clients/openweather", () => ({
  fetchCurrentByCity: vi.fn(),
  fetchForecastByCity: vi.fn(),
}));

import { fetchCurrentByCity, fetchForecastByCity } from "../lib/clients/openweather";
import { getWeatherByCity } from "../lib/services/weather";
import { weatherCache } from "../lib/utils/cache";

const sampleWeather: CurrentWeather = {
  city: "Paris",
  temperature: 18,
  weatherText: "clear sky",
  humidity: 55,
  windSpeed: 12,
  observationTime: "2026-11-14T10:00:00.000Z",
};

const sampleResponse: WeatherResponse = { ...sampleWeather, forecast: [] };

describe("getWeatherByCity", () => {
  beforeEach(() => {
    weatherCache.clear();
    vi.clearAllMocks();
    vi.mocked(fetchForecastByCity).mockResolvedValue({ slots: [], offsetSeconds: 0 });
  });

  it("rejects empty, oversized, and control-character city names", async () => {
    await expect(getWeatherByCity("   ")).rejects.toMatchObject({
      statusCode: 400,
    });
    await expect(getWeatherByCity("x".repeat(101))).rejects.toMatchObject({
      statusCode: 400,
    });
    await expect(getWeatherByCity("Paris\nLondon")).rejects.toMatchObject({
      statusCode: 400,
    });

    expect(fetchCurrentByCity).not.toHaveBeenCalled();
  });

  it("reuses cached data for a normalized city name", async () => {
    vi.mocked(fetchCurrentByCity).mockResolvedValue(sampleWeather);

    const first = await getWeatherByCity("Paris");
    const second = await getWeatherByCity(" PARIS ");

    expect(first).toEqual(sampleResponse);
    expect(second).toEqual(sampleResponse);
    expect(fetchCurrentByCity).toHaveBeenCalledTimes(1);
  });

  it("coalesces concurrent requests for the same city", async () => {
    let resolveRequest!: (value: CurrentWeather) => void;
    vi.mocked(fetchCurrentByCity).mockImplementation(
      () => new Promise((resolve) => { resolveRequest = resolve; })
    );

    const first = getWeatherByCity("Paris");
    const second = getWeatherByCity("PARIS");

    expect(fetchCurrentByCity).toHaveBeenCalledTimes(1);

    resolveRequest(sampleWeather);
    await expect(Promise.all([first, second])).resolves.toEqual([
      sampleResponse,
      sampleResponse,
    ]);
  });

  it("rejects new distinct lookups when the concurrency limit is reached", async () => {
    const resolvers: Array<(value: CurrentWeather) => void> = [];
    vi.mocked(fetchCurrentByCity).mockImplementation(
      () => new Promise((resolve) => { resolvers.push(resolve); })
    );

    const pending = Array.from({ length: 50 }, (_, index) =>
      getWeatherByCity(`city-${index}`)
    );

    await expect(getWeatherByCity("overflow-city")).rejects.toMatchObject({
      statusCode: 503,
    });

    resolvers.forEach((resolve) => resolve(sampleWeather));
    await Promise.all(pending);
    expect(fetchCurrentByCity).toHaveBeenCalledTimes(50);
  });

  it("still returns current weather when the forecast fails, and does not cache that answer", async () => {
    vi.mocked(fetchCurrentByCity).mockResolvedValue(sampleWeather);
    vi.mocked(fetchForecastByCity).mockRejectedValueOnce(new Error("forecast down"));

    await expect(getWeatherByCity("Paris")).resolves.toEqual(sampleResponse);
    await getWeatherByCity("Paris");
    expect(fetchCurrentByCity).toHaveBeenCalledTimes(2);
    expect(fetchForecastByCity).toHaveBeenCalledTimes(2);
  });

  it("fails the whole lookup when current weather fails", async () => {
    vi.mocked(fetchCurrentByCity).mockRejectedValue(Object.assign(new Error("City was not found."), { statusCode: 404 }));
    await expect(getWeatherByCity("Nowhere")).rejects.toMatchObject({ statusCode: 404 });
  });
});
