# Weather Forecast Application

A modern weather application built with **Next.js 14** that provides real-time weather information for any city using the **OpenWeather API**.

The application features a premium, responsive interface with Turkish localization, light/dark mode support, server-side API requests, and TTL-based caching for faster responses and reduced API usage.

## Features

* 🌡️ **Real-time Weather Data**

  * Current temperature
  * Humidity
  * Wind speed
  * Weather conditions

* 🔍 **City-based Search**

  * Search for weather information by city name.

* 🔐 **Secure API Integration**

  * OpenWeather API requests are handled server-side.
  * The API key is never exposed to the client.

* ⚡ **TTL Caching**

  * Weather responses are cached for a configurable period.
  * Reduces unnecessary API requests and improves response times.

* 🎨 **Premium UI**

  * Modern and responsive design.
  * Turkish user interface.
  * Light and dark mode support.

* 🏗️ **Clean Architecture**

  * Separate controller, service, client, utility, and UI layers.
  * Built with Next.js App Router and TypeScript.

---

## Architecture

The project follows a simple layered architecture:

```text
app/
├── api/
│   └── weather/
│       └── route.ts          # API controller
│
├── page.tsx                  # Main UI
│
lib/
├── clients/
│   └── openweather.ts        # OpenWeather API client
│
├── services/
│   └── weather.ts            # Weather business logic
│
└── utils/
    ├── cache.ts              # TTL cache utilities
    └── logger.ts             # Application logging
```

### Main Components

| Component  | Location                     | Responsibility                            |
| ---------- | ---------------------------- | ----------------------------------------- |
| Controller | `app/api/weather/route.ts`   | Handles incoming weather API requests     |
| Service    | `lib/services/weather.ts`    | Contains weather-related business logic   |
| API Client | `lib/clients/openweather.ts` | Communicates with the OpenWeather API     |
| Cache      | `lib/utils/cache.ts`         | Handles TTL-based caching                 |
| Logger     | `lib/utils/logger.ts`        | Provides application logging              |
| UI         | `app/page.tsx`               | Renders the weather application interface |

---

## Tech Stack

### Frontend

* **Next.js 14** – App Router
* **React 18**
* **TypeScript 5**
* **Tailwind CSS**

### Backend

* **Next.js API Routes**
* **OpenWeather REST API**
* **Axios** – HTTP client

### Development Tools

* **ESLint**
* **PostCSS**
* **Autoprefixer**

---

## Requirements

Make sure you have the following installed:

* **Node.js 18+**

  * Node.js 20+ is recommended.
* **npm 10+**

No additional global dependencies are required. All project dependencies are installed automatically with `npm install`.

---

## Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <your-project-directory>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then add your OpenWeather API key to `.env.local`:

```env
OPENWEATHER_API_KEY=your_api_key_here
WEATHER_CACHE_TTL_MINUTES=30
LOG_LEVEL=info
```

> **Important:** Never commit `.env.local` or your API key to the repository.

---

## Running the Application

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at:

```text
http://127.0.0.1:3000
```

### Production

Build the application:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

---

## API

The application exposes a server-side weather endpoint:

```text
GET /api/weather?city={city}
```

### Example

```bash
curl "http://127.0.0.1:3000/api/weather?city=Izmir"
```

The request is processed by the Next.js API route, which communicates with OpenWeather on the server.

This approach keeps the OpenWeather API key hidden from the client.

---

## Environment Variables

| Variable                    | Description                        | Example             |
| --------------------------- | ---------------------------------- | ------------------- |
| `OPENWEATHER_API_KEY`       | OpenWeather API authentication key | `your_api_key_here` |
| `WEATHER_CACHE_TTL_MINUTES` | Cache duration in minutes          | `30`                |
| `LOG_LEVEL`                 | Application logging level          | `info`              |

Example `.env.local`:

```env
OPENWEATHER_API_KEY=your_api_key_here
WEATHER_CACHE_TTL_MINUTES=30
LOG_LEVEL=info
```

---

## Caching

Weather responses are stored in a TTL-based cache.

By default, cached weather data remains available for **30 minutes**:

```env
WEATHER_CACHE_TTL_MINUTES=30
```

This helps:

* Reduce unnecessary requests to OpenWeather.
* Improve response times for repeated searches.
* Reduce API usage.

The cache duration can be adjusted through the environment variable.

---

## Security

The OpenWeather API key is kept exclusively on the server.

Instead of calling OpenWeather directly from the browser:

```text
Browser
   │
   ▼
Next.js API Route
   │
   ▼
Weather Service
   │
   ▼
OpenWeather API
```

This prevents the API key from being exposed in client-side JavaScript or browser network requests.

---

## Project Structure

```text
.
├── app/
│   ├── api/
│   │   └── weather/
│   │       └── route.ts
│   └── page.tsx
│
├── lib/
│   ├── clients/
│   │   └── openweather.ts
│   ├── services/
│   │   └── weather.ts
│   └── utils/
│       ├── cache.ts
│       └── logger.ts
│
├── .env.example
├── .env.local
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## License

This project is intended for educational and development purposes.
Add your preferred license here if the project is distributed publicly.
