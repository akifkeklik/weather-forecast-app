"use client";

import type { WeatherResponse } from "@/lib/types/accuweather";

type WeatherCardProps = {
  data: WeatherResponse;
};

const dateTimeFormatter = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const timeFormatter = new Intl.DateTimeFormat("tr-TR", {
  hour: "2-digit",
  minute: "2-digit",
});

export default function WeatherCard({ data }: WeatherCardProps) {
  const observationDate = new Date(data.observationTime);
  const observationTime = Number.isNaN(observationDate.getTime())
    ? null
    : observationDate;

  return (
    <section className="glass-card space-y-6" aria-label="Hava durumu sonucu">
      <div className="flex items-start justify-between gap-4">
        <div>
          {observationTime && (
            <time className="pill" dateTime={observationTime.toISOString()}>
              {dateTimeFormatter.format(observationTime)}
            </time>
          )}
          <h2 className="text-3xl font-semibold tracking-tight mt-2">
            {data.city}
          </h2>
          <p className="muted-text mt-1">{data.weatherText}</p>
        </div>

        <div
          className="text-6xl font-semibold tracking-tight"
          style={{ color: "var(--accent-solid)" }}
          aria-label={`${data.temperature} derece`}
        >
          {data.temperature}°
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="metric-chip">
          <span className="label">Nem</span>
          <span className="value">{data.humidity}%</span>
        </div>
        <div className="metric-chip">
          <span className="label">Rüzgar</span>
          <span className="value">{data.windSpeed} km/sa</span>
        </div>
        <div className="metric-chip">
          <span className="label">Gözlem saati</span>
          <span className="value">
            {observationTime ? timeFormatter.format(observationTime) : "—"}
          </span>
        </div>
      </div>
    </section>
  );
}
