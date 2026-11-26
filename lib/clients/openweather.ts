import type { CurrentWeather } from "../types/weather";
import type { ForecastSlot } from "../services/forecast";
import { ApiError, ErrorCodes } from "../utils/errors";

const BASE = "https://api.openweathermap.org/data/2.5";

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Calls one OpenWeather endpoint and maps provider failures to API errors. The key never leaves the server. */
async function request(path: "weather" | "forecast", city: string): Promise<unknown> {
  const key = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY;

  if (!key) {
    throw new ApiError(ErrorCodes.SERVER_ERROR, 500, "Weather service is not configured.");
  }

  const url = `${BASE}/${path}?q=${encodeURIComponent(city)}&appid=${encodeURIComponent(key)}&units=metric&lang=tr`;

  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(8000), cache: "no-store" });
  } catch {
    throw new ApiError(
      ErrorCodes.NETWORK_ERROR,
      502,
      "The weather provider could not be reached. Please try again later."
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError(ErrorCodes.INVALID_CITY, 404, "City was not found.");
    }
    if (response.status === 429) {
      throw new ApiError(
        ErrorCodes.RATE_LIMITED,
        429,
        "The weather service is temporarily busy. Please try again later."
      );
    }
    throw new ApiError(
      response.status === 401 || response.status === 403 ? ErrorCodes.SERVER_ERROR : ErrorCodes.API_ERROR,
      502,
      "The weather provider returned an error. Please try again later."
    );
  }

  return raw;
}

function invalidResponse(): ApiError {
  return new ApiError(ErrorCodes.EMPTY_RESPONSE, 502, "The weather provider returned an invalid response.");
}

type OpenWeatherCurrent = {
  name?: unknown;
  main?: { temp?: unknown; humidity?: unknown };
  weather?: Array<{ description?: unknown }>;
  wind?: { speed?: unknown };
  dt?: unknown;
};

export async function fetchCurrentByCity(city: string): Promise<CurrentWeather> {
  const payload = (await request("weather", city)) as OpenWeatherCurrent | null;
  const temperature = payload?.main?.temp;
  const humidity = payload?.main?.humidity;
  const windSpeed = payload?.wind?.speed;
  const description = payload?.weather?.[0]?.description;

  if (
    typeof payload?.name !== "string" ||
    !isNumber(temperature) ||
    !isNumber(humidity) ||
    humidity < 0 ||
    humidity > 100 ||
    (windSpeed !== undefined && (!isNumber(windSpeed) || windSpeed < 0)) ||
    (payload.dt !== undefined && !isNumber(payload.dt))
  ) {
    throw invalidResponse();
  }

  return {
    city: payload.name,
    temperature: Math.round(temperature),
    weatherText: typeof description === "string" ? description : "Bilinmiyor",
    humidity,
    windSpeed: Math.round((isNumber(windSpeed) ? windSpeed : 0) * 3.6),
    observationTime: new Date((isNumber(payload.dt) ? payload.dt : Date.now() / 1000) * 1000).toISOString(),
  };
}

type OpenWeatherForecast = {
  city?: { timezone?: unknown };
  list?: Array<{
    dt?: unknown;
    pop?: unknown;
    main?: { temp_min?: unknown; temp_max?: unknown };
    weather?: Array<{ description?: unknown; main?: unknown }>;
  }>;
};

/** 3-hour slots for the next five days (free OpenWeather plan), plus the city's UTC offset in seconds. */
export async function fetchForecastByCity(
  city: string
): Promise<{ slots: ForecastSlot[]; offsetSeconds: number }> {
  const payload = (await request("forecast", city)) as OpenWeatherForecast | null;
  const offsetSeconds = payload?.city?.timezone;
  const list = payload?.list;
  if (!isNumber(offsetSeconds) || !Array.isArray(list)) throw invalidResponse();

  const slots: ForecastSlot[] = [];
  for (const item of list) {
    const dt = item?.dt;
    const min = item?.main?.temp_min;
    const max = item?.main?.temp_max;
    const pop = item?.pop ?? 0;
    const weather = item?.weather?.[0];
    // A malformed slot is skipped, not fatal: one bad row should not hide five days.
    if (!isNumber(dt) || !isNumber(min) || !isNumber(max) || !isNumber(pop) || pop < 0 || pop > 1) continue;
    slots.push({
      dt,
      min,
      max,
      pop,
      weatherText: typeof weather?.description === "string" ? weather.description : "Bilinmiyor",
      condition: typeof weather?.main === "string" ? weather.main : "Unknown",
    });
  }

  if (slots.length === 0) throw invalidResponse();
  return { slots, offsetSeconds };
}
