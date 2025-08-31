import { NextResponse } from 'next/server';
import { secureResponse } from '@/middleware/security';
import { cache } from '@/lib/cache';
import { monitoring } from '@/lib/monitoring';
import { foodGroupOperations } from '@/lib/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();

  try {
    // Basic system health checks
    const healthChecks = await performHealthChecks();

    const responseTime = Date.now() - startTime;
    const overallStatus = determineOverallStatus(healthChecks);

    // Record health check metrics
    monitoring.recordMetric({
      name: 'health_check',
      value: responseTime,
      unit: 'ms',
      tags: { status: overallStatus },
    });

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime,
      checks: healthChecks,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
      },
    };

    const statusCode =
      overallStatus === 'healthy'
        ? 200
        : overallStatus === 'degraded'
          ? 200
          : 503;

    return secureResponse(NextResponse.json(response, { status: statusCode }));
  } catch (error) {
    const responseTime = Date.now() - startTime;

    monitoring.error('Health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
    });

    return secureResponse(
      NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          responseTime,
          error: 'Health check failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 503 }
      )
    );
  }
}

/**
 * Perform all health checks
 */
async function performHealthChecks(): Promise<
  Record<string, HealthCheckResult>
> {
  const checks: Record<string, HealthCheckResult> = {};

  // Database health check
  checks.database = await checkDatabaseHealth();

  // Cache health check
  checks.cache = await checkCacheHealth();

  // Memory health check
  checks.memory = checkMemoryHealth();

  // API responsiveness check
  checks.api = await checkAPIHealth();

  // External services health check
  checks.external = await checkExternalServicesHealth();

  return checks;
}

/**
 * Check database health
 */
async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    // Try to perform a simple database operation
    await foodGroupOperations.getAll();

    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime,
      details: {
        message: 'Database connection successful',
        operation: 'getAll',
      },
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      status: 'unhealthy',
      responseTime,
      details: {
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'getAll',
      },
    };
  }
}

/**
 * Check cache health
 */
async function checkCacheHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const health = await cache.healthCheck();
    const responseTime = Date.now() - startTime;

    return {
      status: health.status === 'healthy' ? 'healthy' : 'degraded',
      responseTime,
      details: {
        message: `Cache status: ${health.status}`,
        redis: health.redis,
        memory: health.memory,
      },
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      status: 'unhealthy',
      responseTime,
      details: {
        message: 'Cache health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Check memory health
 */
function checkMemoryHealth(): HealthCheckResult {
  const startTime = Date.now();

  try {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
    const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;

    const responseTime = Date.now() - startTime;

    // Consider memory healthy if usage is below 80%
    const status = heapUsagePercent < 80 ? 'healthy' : 'degraded';

    return {
      status,
      responseTime,
      details: {
        message: `Memory usage: ${heapUsagePercent.toFixed(2)}%`,
        heapUsed: `${heapUsedMB.toFixed(2)} MB`,
        heapTotal: `${heapTotalMB.toFixed(2)} MB`,
        heapUsagePercent: heapUsagePercent.toFixed(2),
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      },
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      status: 'unhealthy',
      responseTime,
      details: {
        message: 'Memory health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Check API health
 */
async function checkAPIHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    // Try to make a simple API call to ourselves
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/food-groups?limit=1`
    );

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        status: 'healthy',
        responseTime,
        details: {
          message: 'API endpoint responsive',
          statusCode: response.status,
        },
      };
    } else {
      return {
        status: 'degraded',
        responseTime,
        details: {
          message: 'API endpoint responding but with errors',
          statusCode: response.status,
        },
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      status: 'unhealthy',
      responseTime,
      details: {
        message: 'API health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Check external services health
 */
async function checkExternalServicesHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    // Check if we can reach external services (Firebase, etc.)
    const checks = [];

    // Check Firebase connectivity (if configured)
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      try {
        const firebaseResponse = await fetch(
          'https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys'
        );
        checks.push({
          service: 'firebase',
          status: firebaseResponse.ok ? 'healthy' : 'degraded',
          responseTime: Date.now() - startTime,
        });
      } catch {
        checks.push({
          service: 'firebase',
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
        });
      }
    }

    const responseTime = Date.now() - startTime;

    if (checks.length === 0) {
      return {
        status: 'healthy',
        responseTime,
        details: {
          message: 'No external services configured',
        },
      };
    }

    const healthyChecks = checks.filter(c => c.status === 'healthy').length;
    const totalChecks = checks.length;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (healthyChecks === 0) {
      status = 'unhealthy';
    } else if (healthyChecks < totalChecks) {
      status = 'degraded';
    }

    return {
      status,
      responseTime,
      details: {
        message: `External services: ${healthyChecks}/${totalChecks} healthy`,
        services: checks,
      },
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      status: 'unhealthy',
      responseTime,
      details: {
        message: 'External services health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Determine overall health status
 */
function determineOverallStatus(
  checks: Record<string, HealthCheckResult>
): 'healthy' | 'degraded' | 'unhealthy' {
  const statuses = Object.values(checks).map(check => check.status);

  if (statuses.includes('unhealthy')) {
    return 'unhealthy';
  }

  if (statuses.includes('degraded')) {
    return 'degraded';
  }

  return 'healthy';
}

// Health check result interface
interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  details: Record<string, unknown>;
}
