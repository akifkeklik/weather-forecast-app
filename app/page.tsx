"use client";

import SearchBar from "./components/SearchBar";
import { ThemeToggle } from "./components/ThemeToggle";
import WeatherCard from "./components/WeatherCard";
import { useWeather } from "./hooks/useWeather";

export default function Page() {
  const { data, loading, error, fetchWeather } = useWeather();

  return (
    <main>
      <div className="page-shell">
        <div className="hero-card">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <span className="hero-chip">
                Canlı veri · /api/weather
              </span>
              <h1>
                Premium Hava Durumu
                <span className="pill">
                  Gerçek zamanlı · Anlık sorgu
                </span>
              </h1>
              <p className="muted-text">
                Şehir adını yaz, anlık sıcaklık, nem ve rüzgar bilgisine ışık hızında ulaş. Açık/Koyu mod ile gözünü yorma.
              </p>
            </div>
            <ThemeToggle />
          </div>

          <div className="mt-5 glass-card">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="muted-text text-sm">Örnek istek</p>
                <div className="pill">GET /api/weather?city=Izmir</div>
              </div>
              <SearchBar onSearch={fetchWeather} />
            </div>
          </div>
        </div>

        <div className="grid-panels fade-grid">
          <div className="glass-card">
            <h2 className="font-semibold text-lg">Sonuç</h2>
            <p className="muted-text text-sm mb-3">Yanıt burada görüntülenir.</p>

            {loading && <div className="muted-text">Yükleniyor...</div>}
            {error && <div className="text-red-500 font-semibold">{error}</div>}
            {data && <WeatherCard data={data} />}
            {!loading && !error && !data && (
              <div className="muted-text text-sm">Henüz arama yapılmadı.</div>
            )}
          </div>

          <div className="glass-card space-y-4">
            <h2 className="font-semibold text-lg">Öne Çıkanlar</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="metric-chip">
                <span className="label">Kapsam</span>
                <span className="value">Global şehir verisi</span>
              </div>
              <div className="metric-chip">
                <span className="label">Yanıt süresi</span>
                <span className="value">ms seviyesinde</span>
              </div>
              <div className="metric-chip">
                <span className="label">Önbellek</span>
                <span className="value">TTL kontrollü</span>
              </div>
              <div className="metric-chip">
                <span className="label">Durum</span>
                <span className="value">Anlık güncel</span>
              </div>
            </div>
            <a className="primary-button" href="https://home.openweathermap.org/" target="_blank" rel="noreferrer">
              API anahtarı al
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
