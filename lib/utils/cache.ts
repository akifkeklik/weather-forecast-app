import { CacheEntry } from "../types/accuweather";

class CacheManager {
  private store = new Map<string, CacheEntry<unknown>>();
  private readonly ttlMinutes: number;
  private readonly maxEntries: number;

  constructor(ttlMinutes = 30, maxEntries = 500) {
    this.ttlMinutes =
      Number.isFinite(ttlMinutes) && ttlMinutes > 0 ? ttlMinutes : 30;
    this.maxEntries =
      Number.isInteger(maxEntries) && maxEntries > 0 ? maxEntries : 500;
  }

  set<T>(key: string, data: T): void {
    if (!this.store.has(key) && this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) this.store.delete(oldestKey);
    }

    this.store.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const ageMinutes = (Date.now() - entry.timestamp) / 60000;
    if (ageMinutes >= this.ttlMinutes) {
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
    return this.get(key) !== null;
  }
}

const configuredTtl = Number.parseInt(
  process.env.WEATHER_CACHE_TTL_MINUTES ?? "30",
  10
);

export const weatherCache = new CacheManager(configuredTtl);
