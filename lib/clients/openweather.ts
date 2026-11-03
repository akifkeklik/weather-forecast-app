import { ApiError, ErrorCodes } from "../utils/errors";

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

  const raw: any = await response.json().catch(() => null);

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

  const temperature = raw?.main?.temp;
  const humidity = raw?.main?.humidity;
  if (
    typeof raw?.name !== "string" ||
    typeof temperature !== "number" ||
    typeof humidity !== "number"
  ) {
    throw new ApiError(
      ErrorCodes.EMPTY_RESPONSE,
      502,
      "The weather provider returned an invalid response."
    );
  }

  return {
    city: raw.name,
    temperature: Math.round(temperature),
    weatherText: raw.weather?.[0]?.description ?? "Unknown",
    humidity,
    windSpeed: Math.round((raw.wind?.speed ?? 0) * 3.6),
    observationTime: new Date(
      (typeof raw.dt === "number" ? raw.dt : Date.now() / 1000) * 1000
    ).toISOString(),
  };
}
