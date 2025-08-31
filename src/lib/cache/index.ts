import Redis from 'ioredis';

// Cache configuration
interface CacheConfig {
  redisUrl?: string;
  redisPort?: number;
  redisHost?: string;
  redisPassword?: string;
  redisDb?: number;
  defaultTTL: number; // Time to live in seconds
  maxMemorySize: number; // Maximum memory size in MB
  enableCompression: boolean;
}

// Default configuration
const defaultConfig: CacheConfig = {
  defaultTTL: 3600, // 1 hour
  maxMemorySize: 100, // 100MB
  enableCompression: true,
};

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  compressed?: boolean;
}

// Cache statistics
interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memoryUsage: number;
  lastReset: number;
}

/**
 * Multi-level caching system with Redis and in-memory fallback
 */
export class CacheManager {
  private redis: Redis | null = null;
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    keys: 0,
    memoryUsage: 0,
    lastReset: Date.now(),
  };

  // Enhanced performance metrics
  private operationTimings: Map<string, number[]> = new Map();
  private errorCounts: Map<string, number> = new Map();

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis(): Promise<void> {
    try {
      if (this.config.redisUrl) {
        this.redis = new Redis(this.config.redisUrl);
      } else if (this.config.redisHost) {
        this.redis = new Redis({
          host: this.config.redisHost,
          port: this.config.redisPort || 6379,
          password: this.config.redisPassword,
          db: this.config.redisDb || 0,
          lazyConnect: true,
        });
      }

      if (this.redis) {
        this.redis.on('error', error => {
          console.warn(
            'Redis connection error, falling back to memory cache:',
            error.message
          );
          this.redis = null;
        });

        this.redis.on('connect', () => {
          console.log('Redis connected successfully');
        });

        // Test connection
        await this.redis.ping();
      }
    } catch (error) {
      console.warn(
        'Failed to initialize Redis, using memory cache only:',
        error
      );
      this.redis = null;
    }
  }

  /**
   * Generate cache key
   */
  private generateKey(prefix: string, identifier: string): string {
    return `${prefix}:${identifier}`;
  }

  /**
   * Compress data if enabled
   */
  private compress(data: unknown): string {
    if (!this.config.enableCompression) {
      return JSON.stringify(data);
    }

    // Simple compression for now - in production, use proper compression
    const jsonString = JSON.stringify(data);
    return jsonString.length > 1000 ? `compressed:${jsonString}` : jsonString;
  }

  /**
   * Decompress data
   */
  private decompress(data: string): unknown {
    if (data.startsWith('compressed:')) {
      return JSON.parse(data.substring(11));
    }
    return JSON.parse(data);
  }

  /**
   * Set cache entry
   */
  async set<T>(
    prefix: string,
    identifier: string,
    data: T,
    ttl: number = this.config.defaultTTL
  ): Promise<void> {
    const startTime = Date.now();
    const key = this.generateKey(prefix, identifier);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    try {
      // Try Redis first
      if (this.redis) {
        const compressed = this.compress(entry);
        await this.redis.setex(key, ttl, compressed);
        this.trackOperation('set_redis', Date.now() - startTime);
        return;
      }
    } catch (error) {
      this.trackError('set_redis');
      console.warn('Redis set failed, using memory cache:', error);
    }

    // Fallback to memory cache
    this.setMemoryCache(key, entry);
    this.trackOperation('set_memory', Date.now() - startTime);
  }

  /**
   * Get cache entry
   */
  async get<T>(prefix: string, identifier: string): Promise<T | null> {
    const startTime = Date.now();
    const key = this.generateKey(prefix, identifier);

    try {
      // Try Redis first
      if (this.redis) {
        const data = await this.redis.get(key);
        if (data) {
          this.stats.hits++;
          const entry = this.decompress(data) as CacheEntry<T>;
          this.trackOperation('get_redis', Date.now() - startTime);
          return entry.data;
        }
      }
    } catch (error) {
      this.trackError('get_redis');
      console.warn('Redis get failed, trying memory cache:', error);
    }

    // Fallback to memory cache
    const entry = this.getMemoryCache<T>(key);
    if (entry) {
      this.stats.hits++;
      this.trackOperation('get_memory', Date.now() - startTime);
      return entry.data;
    }

    this.stats.misses++;
    this.trackOperation('get_miss', Date.now() - startTime);
    return null;
  }

  /**
   * Delete cache entry
   */
  async delete(prefix: string, identifier: string): Promise<void> {
    const startTime = Date.now();
    const key = this.generateKey(prefix, identifier);

    try {
      if (this.redis) {
        await this.redis.del(key);
        this.trackOperation('delete_redis', Date.now() - startTime);
      }
    } catch (error) {
      this.trackError('delete_redis');
      console.warn('Redis delete failed:', error);
    }

    // Also remove from memory cache
    this.memoryCache.delete(key);
    this.trackOperation('delete_memory', Date.now() - startTime);
  }

  /**
   * Clear all cache entries with a specific prefix
   */
  async clearPrefix(prefix: string): Promise<void> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(`${prefix}:*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
    } catch (error) {
      console.warn('Redis clear prefix failed:', error);
    }

    // Clear from memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Set memory cache entry
   */
  private setMemoryCache<T>(key: string, entry: CacheEntry<T>): void {
    // Check memory limit
    if (this.memoryCache.size > 1000) {
      // Remove oldest entries
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }

    this.memoryCache.set(key, entry);
    this.updateMemoryStats();
  }

  /**
   * Get memory cache entry
   */
  private getMemoryCache<T>(key: string): CacheEntry<T> | null {
    const entry = this.memoryCache.get(key) as CacheEntry<T>;

    if (!entry) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry;
  }

  /**
   * Update memory usage statistics
   */
  private updateMemoryStats(): void {
    this.stats.keys = this.memoryCache.size;
    this.stats.memoryUsage = this.estimateMemoryUsage();
  }

  /**
   * Estimate memory usage in bytes
   */
  private estimateMemoryUsage(): number {
    let total = 0;
    for (const [key, value] of this.memoryCache.entries()) {
      total += key.length * 2; // UTF-16 characters
      total += JSON.stringify(value).length * 2;
    }
    return total;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      keys: this.memoryCache.size,
      memoryUsage: this.estimateMemoryUsage(),
      lastReset: Date.now(),
    };
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Get enhanced performance metrics
   */
  getPerformanceMetrics(): Record<string, unknown> {
    const metrics: Record<string, unknown> = {};

    // Operation timing metrics
    for (const [operation, timings] of this.operationTimings.entries()) {
      if (timings.length > 0) {
        const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
        const min = Math.min(...timings);
        const max = Math.max(...timings);

        metrics[`${operation}_avg_ms`] = Math.round(avg * 100) / 100;
        metrics[`${operation}_min_ms`] = min;
        metrics[`${operation}_max_ms`] = max;
        metrics[`${operation}_count`] = timings.length;
      }
    }

    // Error metrics
    for (const [operation, count] of this.errorCounts.entries()) {
      metrics[`${operation}_errors`] = count;
    }

    // Hit rate metrics
    const totalRequests = this.stats.hits + this.stats.misses;
    metrics.hit_rate =
      totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    return metrics;
  }

  /**
   * Track operation timing
   */
  private trackOperation(operation: string, duration: number): void {
    if (!this.operationTimings.has(operation)) {
      this.operationTimings.set(operation, []);
    }
    const timings = this.operationTimings.get(operation)!;
    timings.push(duration);

    // Keep only last 100 timings per operation
    if (timings.length > 100) {
      timings.splice(0, timings.length - 100);
    }
  }

  /**
   * Track operation error
   */
  private trackError(operation: string): void {
    const current = this.errorCounts.get(operation) || 0;
    this.errorCounts.set(operation, current + 1);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    redis: boolean;
    memory: boolean;
  }> {
    const redis = this.redis !== null;
    const memory = this.memoryCache.size < 1000;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (!redis && !memory) {
      status = 'unhealthy';
    } else if (!redis || !memory) {
      status = 'degraded';
    }

    return { status, redis, memory };
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
    this.memoryCache.clear();
  }
}

// Create default cache manager instance
export const cacheManager = new CacheManager();

// Export convenience functions
export const cache = {
  set: <T>(prefix: string, identifier: string, data: T, ttl?: number) =>
    cacheManager.set(prefix, identifier, data, ttl),

  get: <T>(prefix: string, identifier: string) =>
    cacheManager.get<T>(prefix, identifier),

  delete: (prefix: string, identifier: string) =>
    cacheManager.delete(prefix, identifier),

  clearPrefix: (prefix: string) => cacheManager.clearPrefix(prefix),

  getStats: () => cacheManager.getStats(),

  resetStats: () => cacheManager.resetStats(),

  getHitRate: () => cacheManager.getHitRate(),

  healthCheck: () => cacheManager.healthCheck(),

  close: () => cacheManager.close(),
};
