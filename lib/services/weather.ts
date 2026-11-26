import { fetchCurrentByCity, fetchForecastByCity } from "../clients/openweather";
import { weatherCache } from "../utils/cache";
import { ApiError, ErrorCodes } from "../utils/errors";
import { logger } from "../utils/logger";
import { toDailyForecast } from "./forecast";
import type { DailyForecast, WeatherResponse } from "../types/weather";

const inFlightRequests = new Map<string, Promise<WeatherResponse>>();
const MAX_CONCURRENT_LOOKUPS = 50;

async function forecastOrNull(city: string): Promise<DailyForecast[] | null> {
  try {
    const { slots, offsetSeconds } = await fetchForecastByCity(city);
    return toDailyForecast(slots, offsetSeconds, Date.now() / 1000);
  } catch (error) {
    // The forecast is extra; a failure here must not hide the current weather.
    logger.warn("Forecast lookup failed", {
      city,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function getWeatherByCity(city: string): Promise<WeatherResponse> {
  const trimmed = typeof city === "string" ? city.trim() : "";

  if (!trimmed) {
    throw new ApiError(ErrorCodes.INVALID_CITY, 400, "Please enter a city name.");
  }

  if (trimmed.length > 100 || /[\u0000-\u001f\u007f]/.test(trimmed)) {
    throw new ApiError(ErrorCodes.INVALID_CITY, 400, "City name is invalid.");
  }

  const key = trimmed.toLowerCase();
  const cached = weatherCache.get<WeatherResponse>(key);
  if (cached) return cached;

  // Coalesce concurrent lookups for the same city into one provider request.
  const existingRequest = inFlightRequests.get(key);
  if (existingRequest) return existingRequest;

  if (inFlightRequests.size >= MAX_CONCURRENT_LOOKUPS) {
    throw new ApiError(
      ErrorCodes.RATE_LIMITED,
      503,
      "The weather service is handling too many requests. Please retry shortly."
    );
  }

  const request = Promise.all([fetchCurrentByCity(trimmed), forecastOrNull(trimmed)])
    .then(([current, forecast]) => {
      const data: WeatherResponse = { ...current, forecast: forecast ?? [] };
      // A degraded answer is not cached, so the next search can still get the forecast.
      if (forecast) weatherCache.set(key, data);
      return data;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, request);
  return request;
}
