import { afterEach, describe, expect, it, vi } from "vitest";
import { CacheManager } from "../lib/utils/cache";

describe("CacheManager", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("expires entries after the configured TTL", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-14T00:00:00.000Z"));

    const cache = new CacheManager(1);
    cache.set("izmir", { temperature: 21 });

    expect(cache.get<{ temperature: number }>("izmir")).toEqual({
      temperature: 21,
    });

    vi.advanceTimersByTime(60_001);

    expect(cache.get("izmir")).toBeNull();
  });

  it("evicts the least recently used entry when capacity is reached", () => {
    const cache = new CacheManager(30, 2);
    cache.set("izmir", 1);
    cache.set("ankara", 2);

    // Reading Izmir makes it more recently used than Ankara.
    expect(cache.get<number>("izmir")).toBe(1);

    cache.set("istanbul", 3);

    expect(cache.get("ankara")).toBeNull();
    expect(cache.get<number>("izmir")).toBe(1);
    expect(cache.get<number>("istanbul")).toBe(3);
  });

  it("uses safe defaults for invalid cache configuration", () => {
    const cache = new CacheManager(Number.NaN, 0);
    cache.set("paris", "cached");

    expect(cache.get<string>("paris")).toBe("cached");
  });
});
