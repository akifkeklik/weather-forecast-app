"use client";

import type { DailyForecast } from "@/lib/types/weather";

const ICONS: Record<string, string> = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
};

const dayFormatter = new Intl.DateTimeFormat("tr-TR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function forecastIcon(condition: string): string {
  return ICONS[condition] ?? "🌫️";
}

export default function ForecastList({ days }: { days: DailyForecast[] }) {
  if (days.length === 0) {
    return <p className="muted-text text-sm">Tahmin şu an alınamadı; güncel durum yukarıda.</p>;
  }

  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-5" aria-label="5 günlük tahmin">
      {days.map((day) => (
        <li key={day.date} className="metric-chip text-center">
          {/* Dates are calendar days in the city's own time zone, so format them as UTC. */}
          <time className="label" dateTime={day.date}>
            {dayFormatter.format(new Date(`${day.date}T00:00:00Z`))}
          </time>
          <span className="text-2xl" role="img" aria-label={day.weatherText}>
            {forecastIcon(day.condition)}
          </span>
          <span className="value">
            {day.max}° <span className="muted-text font-normal">/ {day.min}°</span>
          </span>
          <span className="label">Yağış %{day.precipitationChance}</span>
        </li>
      ))}
    </ol>
  );
}
