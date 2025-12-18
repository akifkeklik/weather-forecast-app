export interface AccuWeatherLocation {
  Key: string;
  LocalizedName: string;
  Country: {
    ID: string;
    LocalizedName: string;
  };
}

export interface AccuWeatherCondition {
  Temperature: {
    Metric: {
      Value: number;
      Unit: string;
    };
  };
  WeatherText: string;
  RelativeHumidity: number;
  Wind: {
    Speed: {
      Metric: {
        Value: number;
        Unit: string;
      };
    };
  };
  ObservationDateTime: string;
}

export interface WeatherResponse {
  city: string;
  temperature: number;
  weatherText: string;
  humidity: number;
  windSpeed: number;
  observationTime: string;
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
