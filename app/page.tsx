"use client";

import ForecastList from "./components/ForecastList";
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
              <h1>Hava Durumu</h1>
              <p className="muted-text">
                Bir şehir ara: güncel sıcaklık, nem ve rüzgar ile önümüzdeki 5 günün tahmini.
              </p>
            </div>
            <ThemeToggle />
          </div>

          <div className="mt-5">
            <SearchBar onSearch={fetchWeather} />
          </div>
        </div>

        <div className="glass-card space-y-6" aria-live="polite" aria-busy={loading}>
          {loading && <div className="muted-text">Yükleniyor...</div>}
          {error && (
            <div role="alert" className="text-red-500 font-semibold">
              {error}
            </div>
          )}
          {data && (
            <>
              <WeatherCard data={data} />
              <section className="space-y-3" aria-labelledby="forecast-heading">
                <h2 id="forecast-heading" className="font-semibold text-lg">
                  5 günlük tahmin
                </h2>
                <ForecastList days={data.forecast} />
              </section>
            </>
          )}
          {!loading && !error && !data && (
            <div className="muted-text text-sm">Henüz arama yapılmadı. Örneğin: İzmir, Paris, Tokyo.</div>
          )}
        </div>

        <p className="muted-text text-xs text-center">
          Veri: <a href="https://openweathermap.org/" target="_blank" rel="noreferrer">OpenWeather</a>
        </p>
      </div>
    </main>
  );
}
