"use client";
import { useState } from "react";

export type WeatherData = {
  city: string;
  temperature: number;
  weatherText: string;
  humidity: number;
  windSpeed: number;
  observationTime: string;
};

export function useWeather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchWeather(city: string) {
    const c = city.trim();
    if (!c) {
      setError("Şehir adı boş olamaz");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(c)}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message || "API error");
      }

      setData(json);
    } catch (e: any) {
      setError(e?.message || "Bir hata oluştu");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, fetchWeather };
}
