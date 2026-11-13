import type { WeatherResponse } from "../types/accuweather";
import { ApiError, ErrorCodes } from "../utils/errors";

type OpenWeatherPayload = {
  name?: unknown;
  main?: {
    temp?: unknown;
    humidity?: unknown;
  };
  weather?: Array<{
    description?: unknown;
  }>;
  wind?: {
    speed?: unknown;
  };
  dt?: unknown;
};

const BASE = "https://api.openweathermap.org/data/2.5/weather";

export async function fetchCurrentByCity(city: string): Promise<WeatherResponse> {
  const key = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY;

  if (!key) {
    throw new ApiError(
      ErrorCodes.SERVER_ERROR,
      500,
      "Weather service is not configured."
    );
  }

  const url = `${BASE}?q=${encodeURIComponent(city)}&appid=${encodeURIComponent(key)}&units=metric`;

  let response: Response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
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
      response.status === 401 || response.status === 403
        ? ErrorCodes.SERVER_ERROR
        : ErrorCodes.API_ERROR,
      502,
      "The weather provider returned an error. Please try again later."
    );
  }

  const payload = raw as OpenWeatherPayload | null;
  const temperature = payload?.main?.temp;
  const humidity = payload?.main?.humidity;
  const windSpeed = payload?.wind?.speed;
  const description = payload?.weather?.[0]?.description;

  if (
    typeof payload?.name !== "string" ||
    typeof temperature !== "number" ||
    !Number.isFinite(temperature) ||
    typeof humidity !== "number" ||
    !Number.isFinite(humidity) ||
    humidity < 0 ||
    humidity > 100 ||
    (windSpeed !== undefined &&
      (typeof windSpeed !== "number" || !Number.isFinite(windSpeed) || windSpeed < 0)) ||
    (payload.dt !== undefined &&
      (typeof payload.dt !== "number" || !Number.isFinite(payload.dt)))
  ) {
    throw new ApiError(
      ErrorCodes.EMPTY_RESPONSE,
      502,
      "The weather provider returned an invalid response."
    );
  }

  return {
    city: payload.name,
    temperature: Math.round(temperature),
    weatherText: typeof description === "string" ? description : "Unknown",
    humidity,
    windSpeed: Math.round((typeof windSpeed === "number" ? windSpeed : 0) * 3.6),
    observationTime: new Date(
      (typeof payload.dt === "number" ? payload.dt : Date.now() / 1000) * 1000
    ).toISOString(),
  };
}
