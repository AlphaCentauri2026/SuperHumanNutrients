import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor, loggingService } from '@/lib/monitoring';
import { cache } from '@/lib/cache';
import {
  createSecurityMiddleware,
  secureResponse,
} from '@/middleware/security';

// Apply security middleware
const secureHandler = createSecurityMiddleware({
  allowedMethods: ['GET'],
  maxRequestSize: 1024,
});

export async function GET(request: NextRequest) {
  try {
    // Apply security middleware
    const securityResult = await secureHandler(request);
    if (securityResult) {
      return securityResult;
    }

    // Collect all metrics
    const metrics = await collectAllMetrics();

    // Return metrics as JSON with custom headers
    const response = NextResponse.json(metrics, { status: 200 });
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return secureResponse(response);
  } catch (error) {
    loggingService.error('Failed to collect metrics', { error });
    return secureResponse(
      NextResponse.json({ error: 'Failed to collect metrics' }, { status: 500 })
    );
  }
}

async function collectAllMetrics(): Promise<Record<string, unknown>> {
  const startTime = Date.now();

  try {
    // Performance metrics
    const performanceStats = performanceMonitor.getStats();

    // Cache metrics
    const cacheStats = cache.getStats();
    const cachePerformance =
      (
        cache as { getPerformanceMetrics?: () => Record<string, unknown> }
      ).getPerformanceMetrics?.() || {};

    // System metrics
    const systemMetrics = await getSystemMetrics();

    // API metrics
    const apiMetrics = await getApiMetrics();

    const collectionTime = Date.now() - startTime;

    return {
      timestamp: new Date().toISOString(),
      collection_time_ms: collectionTime,

      // Performance metrics
      performance: {
        total_requests: performanceStats.totalRequests,
        average_response_time_ms:
          Math.round(performanceStats.averageResponseTime * 100) / 100,
        slowest_request_ms: performanceStats.slowestRequest,
        fastest_request_ms: performanceStats.fastestRequest,
        error_rate_percent: Math.round(performanceStats.errorRate * 100) / 100,
        memory_usage_mb: Math.round(performanceStats.memoryUsage * 100) / 100,
      },

      // Cache metrics
      cache: {
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        hit_rate_percent: Math.round(cache.getHitRate() * 100) / 100,
        total_keys: cacheStats.keys,
        memory_usage_bytes: cacheStats.memoryUsage,
        last_reset: new Date(cacheStats.lastReset).toISOString(),
        performance: cachePerformance,
      },

      // System metrics
      system: systemMetrics,

      // API metrics
      api: apiMetrics,

      // Health status
      health: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    loggingService.error('Error collecting metrics', { error });
    throw error;
  }
}

async function getSystemMetrics(): Promise<Record<string, unknown>> {
  const metrics: Record<string, unknown> = {};

  try {
    // Node.js process metrics
    if (typeof process !== 'undefined') {
      metrics.process = {
        uptime_seconds: Math.round(process.uptime() * 100) / 100,
        memory_usage_mb: {
          rss:
            Math.round((process.memoryUsage().rss / 1024 / 1024) * 100) / 100,
          heap_used:
            Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
            100,
          heap_total:
            Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
            100,
          external:
            Math.round((process.memoryUsage().external / 1024 / 1024) * 100) /
            100,
        },
        cpu_usage: process.cpuUsage
          ? {
              user: process.cpuUsage().user,
              system: process.cpuUsage().system,
            }
          : 'unavailable',
      };
    }

    // Environment info
    metrics.environment = {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      env: process.env.NODE_ENV || 'development',
    };

    // Browser metrics (if available)
    if (typeof performance !== 'undefined') {
      try {
        const memory = (
          performance as {
            memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number };
          }
        ).memory;
        if (memory) {
          metrics.browser = {
            memory_used_mb:
              Math.round((memory.usedJSHeapSize / 1024 / 1024) * 100) / 100,
            memory_limit_mb:
              Math.round((memory.jsHeapSizeLimit / 1024 / 1024) * 100) / 100,
          };
        }
      } catch {
        // Browser metrics not available
      }
    }
  } catch (error) {
    loggingService.warn('Failed to collect system metrics', { error });
    metrics.error = 'Failed to collect system metrics';
  }

  return metrics;
}

async function getApiMetrics(): Promise<Record<string, unknown>> {
  const metrics: Record<string, unknown> = {};

  try {
    // Get metrics from performance monitor
    const performanceStats = performanceMonitor.getStats();

    metrics.requests = {
      total: performanceStats.totalRequests,
      average_response_time_ms:
        Math.round(performanceStats.averageResponseTime * 100) / 100,
      error_rate_percent: Math.round(performanceStats.errorRate * 100) / 100,
    };

    // Add any additional API-specific metrics here
    // This could include endpoint-specific metrics, rate limiting stats, etc.
  } catch (error) {
    loggingService.warn('Failed to collect API metrics', { error });
    metrics.error = 'Failed to collect API metrics';
  }

  return metrics;
}
