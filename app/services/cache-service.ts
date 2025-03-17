"use server";

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class Cache<T> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private ttl: number; // Time to live in milliseconds
  private maxItems: number; // Maximum number of items to store

  constructor(ttlMinutes = 60, maxItems = 100) {
    this.ttl = ttlMinutes * 60 * 1000;
    this.maxItems = maxItems;
  }

  set(key: string, data: T): void {
    if (this.cache.size >= this.maxItems) {
      const oldestKey = this.findOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  private findOldestKey(): string | undefined {
    let oldestKey: string | undefined;
    let oldestTime = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }
    return oldestKey;
  }
}

const newsCache = new Cache<any>(30, 50);

// ✅ Xuất các hàm thay vì object
export async function cacheSet(key: string, data: any) {
  newsCache.set(key, data);
}

export async function cacheGet(key: string) {
  return newsCache.get(key);
}

export async function cacheHas(key: string) {
  return newsCache.has(key);
}

export async function cacheClear() {
  newsCache.clear();
}
