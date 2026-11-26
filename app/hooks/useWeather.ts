"use client";

import { useEffect, useRef, useState } from "react";
import type { DailyForecast, WeatherResponse } from "@/lib/types/weather";

export type WeatherData = WeatherResponse;

function isDailyForecast(value: unknown): value is DailyForecast {
  if (typeof value !== "object" || value === null) return false;
  const day = value as Record<string, unknown>;
  return (
    typeof day.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(day.date) &&
    typeof day.min === "number" &&
    Number.isFinite(day.min) &&
    typeof day.max === "number" &&
    Number.isFinite(day.max) &&
    typeof day.weatherText === "string" &&
    typeof day.condition === "string" &&
    typeof day.precipitationChance === "number" &&
    day.precipitationChance >= 0 &&
    day.precipitationChance <= 100
  );
}

export function isWeatherResponse(value: unknown): value is WeatherResponse {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.city === "string" &&
    candidate.city.length > 0 &&
    typeof candidate.temperature === "number" &&
    Number.isFinite(candidate.temperature) &&
    typeof candidate.humidity === "number" &&
    Number.isFinite(candidate.humidity) &&
    candidate.humidity >= 0 &&
    candidate.humidity <= 100 &&
    typeof candidate.windSpeed === "number" &&
    Number.isFinite(candidate.windSpeed) &&
    candidate.windSpeed >= 0 &&
    typeof candidate.weatherText === "string" &&
    typeof candidate.observationTime === "string" &&
    Number.isFinite(Date.parse(candidate.observationTime)) &&
    Array.isArray(candidate.forecast) &&
    candidate.forecast.every(isDailyForecast)
  );
}

export function useWeather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      activeRequest.current?.abort();
      activeRequest.current = null;
    };
  }, []);

  async function fetchWeather(city: string) {
    const normalizedCity = city.trim();
    if (!normalizedCity) {
      setError("Şehir adı boş olamaz");
      return;
    }

    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(normalizedCity)}`,
        { signal: controller.signal }
      );
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          typeof payload === "object" &&
          payload !== null &&
          "message" in payload &&
          typeof payload.message === "string"
            ? payload.message
            : "Hava durumu bilgisi alınamadı.";
        throw new Error(message);
      }

      if (!isWeatherResponse(payload)) {
        throw new Error("Sunucudan geçersiz hava durumu verisi alındı.");
      }

      if (!controller.signal.aborted) {
        setData(payload);
      }
    } catch (error: unknown) {
      if (controller.signal.aborted) return;
      setError(error instanceof Error ? error.message : "Bir hata oluştu.");
      setData(null);
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setLoading(false);
      }
    }
  }

  return { data, loading, error, fetchWeather };
}
