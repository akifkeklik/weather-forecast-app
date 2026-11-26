/** Current conditions for one city, as the API returns them. */
export interface CurrentWeather {
  city: string;
  temperature: number;
  weatherText: string;
  humidity: number;
  windSpeed: number;
  observationTime: string;
}

/** One calendar day in the city's own time zone. */
export interface DailyForecast {
  /** YYYY-MM-DD in the city's local time. */
  date: string;
  min: number;
  max: number;
  weatherText: string;
  /** Provider condition group, e.g. "Clear", "Rain". */
  condition: string;
  /** Highest chance of precipitation during the day, 0–100. */
  precipitationChance: number;
}

export interface WeatherResponse extends CurrentWeather {
  /** Empty when the forecast provider failed; current weather is still shown. */
  forecast: DailyForecast[];
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface WeatherError {
  code: string;
  message: string;
  statusCode: number;
}
