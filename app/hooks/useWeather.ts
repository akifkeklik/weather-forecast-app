"use client";

import { useEffect, useRef, useState } from "react";
import type { WeatherResponse } from "@/lib/types/accuweather";

export type WeatherData = WeatherResponse;

export function useWeather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => activeRequest.current?.abort();
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

      if (
        typeof payload !== "object" ||
        payload === null ||
        !("city" in payload) ||
        typeof payload.city !== "string" ||
        !("temperature" in payload) ||
        typeof payload.temperature !== "number" ||
        !("humidity" in payload) ||
        typeof payload.humidity !== "number" ||
        !("windSpeed" in payload) ||
        typeof payload.windSpeed !== "number" ||
        !("weatherText" in payload) ||
        typeof payload.weatherText !== "string" ||
        !("observationTime" in payload) ||
        typeof payload.observationTime !== "string"
      ) {
        throw new Error("Sunucudan geçersiz hava durumu verisi alındı.");
      }

      if (!controller.signal.aborted) {
        setData(payload as WeatherData);
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
