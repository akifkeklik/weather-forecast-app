import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchCurrentByCity, fetchForecastByCity } from "../lib/clients/openweather";

const fetchMock = vi.fn();

function reply(status: number, body: unknown) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }));
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("OPENWEATHER_API_KEY", "secret-key");
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("fetchCurrentByCity", () => {
  it("maps the provider payload and asks for Turkish descriptions in metric units", async () => {
    fetchMock.mockReturnValue(
      reply(200, {
        name: "İzmir",
        main: { temp: 21.6, humidity: 48 },
        weather: [{ description: "açık" }],
        wind: { speed: 3 },
        dt: 1_800_000_000,
      })
    );

    await expect(fetchCurrentByCity("İzmir")).resolves.toEqual({
      city: "İzmir",
      temperature: 22,
      weatherText: "açık",
      humidity: 48,
      windSpeed: 11,
      observationTime: new Date(1_800_000_000_000).toISOString(),
    });
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("/weather?q=%C4%B0zmir");
    expect(url).toContain("units=metric");
    expect(url).toContain("lang=tr");
  });

  it("turns provider statuses into safe errors without leaking the key", async () => {
    fetchMock.mockReturnValueOnce(reply(404, { message: "city not found" }));
    await expect(fetchCurrentByCity("Nowhere")).rejects.toMatchObject({ statusCode: 404, code: "INVALID_CITY" });

    fetchMock.mockReturnValueOnce(reply(429, {}));
    await expect(fetchCurrentByCity("Paris")).rejects.toMatchObject({ statusCode: 429 });

    fetchMock.mockReturnValueOnce(reply(401, { message: "Invalid API key secret-key" }));
    const error = await fetchCurrentByCity("Paris").catch((e: Error) => e);
    expect(error).toMatchObject({ statusCode: 502, code: "SERVER_ERROR" });
    expect(String((error as Error).message)).not.toContain("secret-key");
  });

  it("reports an unreachable provider as 502", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    await expect(fetchCurrentByCity("Paris")).rejects.toMatchObject({ statusCode: 502, code: "NETWORK_ERROR" });
  });

  it("rejects an impossible payload", async () => {
    fetchMock.mockReturnValue(reply(200, { name: "Paris", main: { temp: 10, humidity: 140 } }));
    await expect(fetchCurrentByCity("Paris")).rejects.toMatchObject({ code: "EMPTY_RESPONSE" });
  });

  it("refuses to call the provider without a key", async () => {
    vi.stubEnv("OPENWEATHER_API_KEY", "");
    vi.stubEnv("WEATHER_API_KEY", "");
    await expect(fetchCurrentByCity("Paris")).rejects.toMatchObject({ statusCode: 500 });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("fetchForecastByCity", () => {
  it("keeps valid 3-hour slots, skips malformed ones and returns the city's offset", async () => {
    fetchMock.mockReturnValue(
      reply(200, {
        city: { timezone: 10_800 },
        list: [
          { dt: 100, pop: 0.2, main: { temp_min: 5, temp_max: 9 }, weather: [{ description: "yağmur", main: "Rain" }] },
          { dt: "bad", main: { temp_min: 5, temp_max: 9 } },
          { dt: 200, pop: 7, main: { temp_min: 5, temp_max: 9 } },
          { dt: 300, main: { temp_min: 1, temp_max: 2 } },
        ],
      })
    );

    const { slots, offsetSeconds } = await fetchForecastByCity("Ankara");
    expect(offsetSeconds).toBe(10_800);
    expect(slots).toEqual([
      { dt: 100, min: 5, max: 9, pop: 0.2, weatherText: "yağmur", condition: "Rain" },
      { dt: 300, min: 1, max: 2, pop: 0, weatherText: "Bilinmiyor", condition: "Unknown" },
    ]);
    expect(String(fetchMock.mock.calls[0][0])).toContain("/forecast?q=Ankara");
  });

  it("fails when no slot is usable", async () => {
    fetchMock.mockReturnValue(reply(200, { city: { timezone: 0 }, list: [{ dt: "x" }] }));
    await expect(fetchForecastByCity("Ankara")).rejects.toMatchObject({ code: "EMPTY_RESPONSE" });
  });
});
