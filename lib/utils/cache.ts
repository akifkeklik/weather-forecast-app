import { CacheEntry } from '../types/accuweather';

class CacheManager {
  private store = new Map<string, CacheEntry<unknown>>();
  private readonly ttlMinutes: number;

  constructor(ttlMinutes: number = 30) {
    this.ttlMinutes = ttlMinutes;
  }

  set<T>(key: string, data: T): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const ageMinutes = (Date.now() - entry.timestamp) / (1000 * 60);
    if (ageMinutes > this.ttlMinutes) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.store.clear();
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  has(key: string): boolean {
    const value = this.get(key);
    return value !== null;
  }
}

export const weatherCache = new CacheManager(
  parseInt(process.env.WEATHER_CACHE_TTL_MINUTES || '30', 10)
);

