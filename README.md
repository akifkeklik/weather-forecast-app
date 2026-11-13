# Weather Dashboard

A small full-stack weather dashboard built with Next.js App Router, React, and TypeScript. It retrieves current conditions for a city from OpenWeather and keeps the provider credential on the server.

This is a portfolio project focused on clear request boundaries, typed data handling, resilient API integration, and a responsive Turkish-language interface.

## What it does

- Searches current weather by city.
- Displays temperature, condition, humidity, wind speed, and the provider's observation time.
- Supports light and dark themes.
- Calls OpenWeather only from the server-side API client; the API key is not sent to the browser.
- Uses an in-memory TTL cache with a maximum of 500 entries per application process.
- Coalesces simultaneous requests for the same city and limits concurrent upstream lookups.
- Applies an upstream request timeout and maps provider/network failures to controlled API errors.
- Cancels superseded browser requests and validates API response data before rendering.

> This application currently retrieves **current weather**, not multi-day forecasts. The cache is process-local and is not shared between multiple server instances.

## Architecture

```text
Browser
  |
  | GET /api/weather?city=Izmir
  v
Next.js Route Handler
  |
  v
Weather Service --------------------+
  |                                 |
  | cache hit                       | cache miss
  v                                 v
Cached response               OpenWeather client
                                    |
                                    v
                              OpenWeather API

Client UI:
  Page -> useWeather hook -> typed SearchBar / WeatherCard
```

| Layer | Location | Responsibility |
| --- | --- | --- |
| Route handler | `app/api/weather/route.ts` | HTTP boundary and error response |
| Service | `lib/services/weather.ts` | Input validation, cache lookup, request coalescing |
| Provider client | `lib/clients/openweather.ts` | External HTTP call, timeout, provider response validation |
| Cache | `lib/utils/cache.ts` | Bounded in-memory TTL/LRU cache |
| Types | `lib/types/accuweather.ts` | Shared response and error contracts |
| UI hook | `app/hooks/useWeather.ts` | Request lifecycle, cancellation, client-side validation |
| Components | `app/components` | Search form, weather result, theme controls |

## Technology

- Next.js App Router
- React
- TypeScript (strict mode)
- OpenWeather Current Weather API
- CSS / Tailwind utility classes
- ESLint configuration

## Requirements

- Node.js 24 or newer (the CI pipeline uses Node 24)
- npm

## Getting started

1. Clone the repository:

   ```bash
   git clone https://github.com/akifkeklik/weather-forecast-app.git
   cd weather-forecast-app
   ```

2. Install the exact dependency versions from the lockfile:

   ```bash
   npm ci
   ```

3. Create a local environment file:

   **PowerShell**
   ```powershell
   Copy-Item .env.example .env.local
   ```

   **macOS / Linux**
   ```bash
   cp .env.example .env.local
   ```

4. Add your OpenWeather API key to `.env.local`:

   ```env
   OPENWEATHER_API_KEY=your_api_key
   WEATHER_CACHE_TTL_MINUTES=30
   LOG_LEVEL=info
   ```

   Obtain a key from [OpenWeather](https://openweathermap.org/api). Never commit `.env.local` or expose the key through a `NEXT_PUBLIC_*` variable.

5. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run lint
npm run typecheck
npm run build
npm start
```

## API

### `GET /api/weather?city={city}`

Example:

```bash
curl "http://localhost:3000/api/weather?city=Izmir"
```

Successful response:

```json
{
  "city": "Izmir",
  "temperature": 22,
  "weatherText": "clear sky",
  "humidity": 48,
  "windSpeed": 10,
  "observationTime": "2026-11-14T10:00:00.000Z"
}
```

The values above are illustrative; live values depend on the provider response.

| Status | Meaning |
| --- | --- |
| `200` | Current weather returned |
| `400` | Missing or invalid city |
| `404` | City not found by provider |
| `429` | Provider rate limit |
| `502` | Provider/network failure or invalid upstream response |
| `503` | Local concurrent lookup limit reached |
| `500` | Server configuration or unexpected error |

Responses use `Cache-Control: no-store` at the HTTP layer because freshness is managed explicitly by the service cache.

## Configuration

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `OPENWEATHER_API_KEY` | Yes | — | Server-side provider credential |
| `WEATHER_CACHE_TTL_MINUTES` | No | `30` | In-memory cache lifetime |
| `LOG_LEVEL` | No | `info` | Application log verbosity |

## Engineering notes and trade-offs

- **Process-local cache:** the cache is bounded to 500 entries and uses TTL plus least-recently-used eviction. It is suitable for a small single-instance deployment, not a horizontally scaled production system. A shared Redis cache would be needed for cross-instance consistency.
- **Request coalescing:** concurrent lookups for the same normalized city share one upstream request. A limit of 50 distinct in-flight lookups protects the provider integration from unbounded concurrency within one process.
- **Cancellation:** when a user starts a new search, the previous browser request is aborted. This prevents stale responses from replacing newer results.
- **Validation:** provider payloads and browser-facing responses are checked before use; external API errors are not forwarded verbatim.
- **Freshness:** the timestamp shown is the observation timestamp supplied by the weather provider, not the time the browser requested the data.

## Current scope

The project demonstrates a focused current-weather workflow. It does not currently provide multi-day forecasting, persistent/distributed caching, user accounts, or a production observability stack. Those are deliberate scope boundaries rather than claimed features.

## License

No license file is currently included. All rights remain with the author unless a license is added.
