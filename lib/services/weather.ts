import { fetchCurrentByCity } from "../clients/openweather";
import { weatherCache } from "../utils/cache";
import { ApiError, ErrorCodes } from "../utils/errors";
import type { WeatherResponse } from "../types/accuweather";

const inFlightRequests = new Map<string, Promise<WeatherResponse>>();

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
