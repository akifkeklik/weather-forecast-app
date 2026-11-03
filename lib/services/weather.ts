import { fetchCurrentByCity } from "../clients/openweather";
import { weatherCache } from "../utils/cache";
import { ApiError, ErrorCodes } from "../utils/errors";

export async function getWeatherByCity(city: string) {
  const trimmed = typeof city === "string" ? city.trim() : "";

  if (!trimmed) {
    throw new ApiError(ErrorCodes.INVALID_CITY, 400, "Please enter a city name.");
  }

  if (trimmed.length > 100) {
    throw new ApiError(ErrorCodes.INVALID_CITY, 400, "City name is too long.");
  }

  const key = trimmed.toLocaleLowerCase("en-US");
  const cached = weatherCache.get(key);
  if (cached) return cached;

  const data = await fetchCurrentByCity(trimmed);
  weatherCache.set(key, data);

  return data;
}
