<img width="1440" height="3120" alt="image" src="https://github.com/user-attachments/assets/dba5f274-52c8-4155-b703-871ab9d39c75" /># Weather Forecast App

Next.js App Router ile OpenWeather’dan şehir bazlı hava durumu. Türkçe arayüz, premium tema, Açık/Koyu mod.


## Proje

- Şehir adıyla anlık sıcaklık, nem ve rüzgâr bilgisi.
- Sunucu tarafı istekler ile API anahtarı güvende; TTL önbellek ile hızlı yanıt.

## Mimari

- Controller: [app/api/weather/route.ts](app/api/weather/route.ts)
- Service: [lib/services/weather.ts](lib/services/weather.ts)
- Client: [lib/clients/openweather.ts](lib/clients/openweather.ts)
- Utils: [lib/utils/cache.ts](lib/utils/cache.ts), [lib/utils/logger.ts](lib/utils/logger.ts)
- UI: [app/page.tsx](app/page.tsx)

## Teknolojiler

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS
- **Backend**: Next.js API Routes, OpenWeather REST API entegrasyonu, axios

## Kurulum

```bash
npm install
cp .env.example .env.local
# .env.local içine kendi anahtarını yaz (OPENWEATHER_API_KEY=xxx)
```

**Gereksinimler**

- Node.js 18+ (öneri: 20+), npm 10+
- `npm install` tüm gerekli paketleri otomatik indirir; ekstra global kurulum gerekmez.

**Bağımlılıklar (özet)**

- next, react, react-dom
- tailwindcss, postcss, autoprefixer
- typescript, eslint, eslint-config-next
- axios (opsiyonel)

## Çalıştırma

```bash
# Geliştirme
npm run dev
# Prod
npm run build
npm start
```

- Uygulama: http://127.0.0.1:3000
- API: http://127.0.0.1:3000/api/weather?city=Izmir

## API Örneği

```bash
curl "http://127.0.0.1:3000/api/weather?city=Izmir"
```

## Ortam Değişkenleri

```env
OPENWEATHER_API_KEY=your_api_key_here
WEATHER_CACHE_TTL_MINUTES=30
LOG_LEVEL=info
```
