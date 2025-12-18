import { fetchCurrentByCity } from "../clients/openweather";
import { weatherCache } from "../utils/cache";

export async function getWeatherByCity(city: string) {
  const trimmed = city?.trim();
  if (!trimmed) throw new Error("City is required");

  const key = trimmed.toLowerCase();

  const cached = weatherCache.get(key);
  if (cached) return cached;

  const data = await fetchCurrentByCity(trimmed);

  weatherCache.set(key, data);
  return data;
}
