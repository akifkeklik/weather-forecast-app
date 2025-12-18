export type OpenWeatherNormalized = {
  city: string;
  temperature: number;
  weatherText: string;
  humidity: number;
  windSpeed: number;
  observationTime: string;
};

const BASE = "https://api.openweathermap.org/data/2.5/weather";

export async function fetchCurrentByCity(city: string): Promise<OpenWeatherNormalized> {
 const key = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY;

  if (!key) throw new Error("OPENWEATHER_API_KEY is missing");

  const url = `${BASE}?q=${encodeURIComponent(city)}&appid=${key}&units=metric`;
  const res = await fetch(url);

  // OpenWeather error body
  const raw = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = raw?.message || "OpenWeather request failed";
    throw new Error(`OPENWEATHER_ERROR_${res.status}: ${msg}`);
  }

  return {
    city: raw.name,
    temperature: Math.round(raw.main.temp),
    weatherText: raw.weather?.[0]?.description ?? "Unknown",
    humidity: raw.main.humidity,
    windSpeed: Math.round((raw.wind?.speed ?? 0) * 3.6), // m/s -> km/h
    observationTime: new Date((raw.dt ?? Date.now() / 1000) * 1000).toISOString(),
  };
}
