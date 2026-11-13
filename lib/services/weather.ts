import { fetchCurrentByCity } from "../clients/openweather";
import { weatherCache } from "../utils/cache";
import { ApiError, ErrorCodes } from "../utils/errors";
import type { WeatherResponse } from "../types/accuweather";

const inFlightRequests = new Map<string, Promise<WeatherResponse>>();
const MAX_CONCURRENT_LOOKUPS = 50;

export async function getWeatherByCity(city: string): Promise<WeatherResponse> {
  const trimmed = typeof city === "string" ? city.trim() : "";

  if (!trimmed) {
    throw new ApiError(ErrorCodes.INVALID_CITY, 400, "Please enter a city name.");
  }

  if (trimmed.length > 100 || /[\u0000-\u001f\u007f]/.test(trimmed)) {
    throw new ApiError(ErrorCodes.INVALID_CITY, 400, "City name is invalid.");
  }

  const key = trimmed.toLocaleLowerCase("tr-TR");
  const cached = weatherCache.get(key);
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

  const request = fetchCurrentByCity(trimmed)
    .then((data) => {
      weatherCache.set(key, data);
      return data;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, request);
  return request;
}
