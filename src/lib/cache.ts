// Simple in-memory cache for API responses
// In production, consider using Redis or similar

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100; // Maximum number of entries
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  set<T>(key: string, data: T, ttl?: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Get cache statistics
  getStats(): {
    size: number;
    maxSize: number;
    hitRate?: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }
}

// Global cache instance
export const cache = new MemoryCache();

// Cache key generators
export const CacheKeys = {
  memories: (page?: number) => `memories:${page || 'all'}`,
  letters: () => 'letters:all',
  anniversaries: () => 'anniversaries:all',
  albums: () => 'albums:all',
  cities: () => 'cities:visited',
  songs: () => 'songs:all',
  media: (memoryId: string) => `media:${memoryId}`,
  user: (username: string) => `user:${username}`
};

// Cache decorator for functions
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    const cached = cache.get(key);
    
    if (cached !== null) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 Cache hit: ${key}`);
      }
      return cached;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`💾 Cache miss: ${key}`);
    }

    const result = await fn(...args);
    cache.set(key, result, ttl);
    
    return result;
  }) as T;
}

// Cache invalidation helpers
export function invalidateMemories(): void {
  cache.delete(CacheKeys.memories());
  cache.delete(CacheKeys.cities());
  cache.delete(CacheKeys.albums());
}

export function invalidateLetters(): void {
  cache.delete(CacheKeys.letters());
}

export function invalidateAnniversaries(): void {
  cache.delete(CacheKeys.anniversaries());
}

export function invalidateSongs(): void {
  cache.delete(CacheKeys.songs());
}

export function invalidateAll(): void {
  cache.clear();
}
