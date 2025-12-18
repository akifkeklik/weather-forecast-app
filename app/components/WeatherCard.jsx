"use client";

export default function WeatherCard({ data }) {
  return (
    <section className="glass-card space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="pill">{new Date(data.observationTime).toLocaleString("tr-TR")}</div>
          <h2 className="text-3xl font-semibold tracking-tight mt-2">{data.city}</h2>
          <p className="muted-text mt-1">{data.weatherText}</p>
        </div>

        <div className="text-6xl font-semibold tracking-tight" style={{ color: "var(--accent-solid)" }}>
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
          <span className="label">Kayıt</span>
          <span className="value">{new Date(data.observationTime).toLocaleTimeString("tr-TR")}</span>
        </div>
      </div>
    </section>
  );
}
