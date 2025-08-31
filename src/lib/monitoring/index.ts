// Performance monitoring system
interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags: Record<string, string>;
}

interface PerformanceStats {
  totalRequests: number;
  averageResponseTime: number;
  slowestRequest: number;
  fastestRequest: number;
  errorRate: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface LogContext {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Performance monitoring service
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private requestTimes: number[] = [];
  private errors: number = 0;
  private requests: number = 0;
  private startTime: number = Date.now();

  /**
   * Record a performance metric
   */
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    this.metrics.push({
      ...metric,
      timestamp: Date.now(),
    });

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Record request response time
   */
  recordRequestTime(responseTime: number): void {
    this.requestTimes.push(responseTime);
    this.requests++;

    // Keep only last 1000 request times
    if (this.requestTimes.length > 1000) {
      this.requestTimes = this.requestTimes.slice(-1000);
    }
  }

  /**
   * Record an error
   */
  recordError(operation?: string, error?: Error): void {
    this.errors++;

    if (operation && error) {
      // Log detailed error information
      loggingService.error('Performance Monitor Error', {
        operation,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): PerformanceStats {
    const avgResponseTime =
      this.requestTimes.length > 0
        ? this.requestTimes.reduce((a, b) => a + b, 0) /
          this.requestTimes.length
        : 0;

    const slowestRequest =
      this.requestTimes.length > 0 ? Math.max(...this.requestTimes) : 0;

    const fastestRequest =
      this.requestTimes.length > 0 ? Math.min(...this.requestTimes) : 0;

    const errorRate =
      this.requests > 0 ? (this.errors / this.requests) * 100 : 0;

    return {
      totalRequests: this.requests,
      averageResponseTime: avgResponseTime,
      slowestRequest,
      fastestRequest,
      errorRate,
      cacheHitRate: 0, // Will be populated by cache manager
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: this.getCpuUsage(),
    };
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as { memory: { usedJSHeapSize: number } })
        .memory;
      return memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  /**
   * Get CPU usage (estimated)
   */
  private getCpuUsage(): number {
    // This is a simplified estimation
    // In production, use proper CPU monitoring
    return 0;
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * Get metrics by time range
   */
  getMetricsByTimeRange(
    startTime: number,
    endTime: number
  ): PerformanceMetric[] {
    return this.metrics.filter(
      m => m.timestamp >= startTime && m.timestamp <= endTime
    );
  }

  /**
   * Get error rate for a specific operation
   */
  getErrorRateByOperation(operation: string): number {
    const operationMetrics = this.metrics.filter(
      m => m.name === operation && m.tags?.type === 'error'
    );
    const totalOperationMetrics = this.metrics.filter(
      m => m.name === operation
    );

    if (totalOperationMetrics.length === 0) return 0;
    return operationMetrics.length / totalOperationMetrics.length;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = [];
    this.requestTimes = [];
    this.errors = 0;
    this.requests = 0;
    this.startTime = Date.now();
  }
}

/**
 * Logging service
 */
export class LoggingService {
  private logs: LogContext[] = [];
  private maxLogs: number = 1000;

  /**
   * Log a message
   */
  log(
    level: LogContext['level'],
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    const logEntry: LogContext = {
      level,
      message,
      timestamp: Date.now(),
      metadata,
    };

    this.logs.push(logEntry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console[level](
        `[${new Date(logEntry.timestamp).toISOString()}] ${level.toUpperCase()}: ${message}`,
        metadata
      );
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log('debug', message, metadata);
  }

  /**
   * Log info message
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    this.log('info', message, metadata);
  }

  /**
   * Log warning message
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log('warn', message, metadata);
  }

  /**
   * Log error message
   */
  error(message: string, metadata?: Record<string, unknown>): void {
    this.log('error', message, metadata);
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogContext['level']): LogContext[] {
    return this.logs.filter(l => l.level === level);
  }

  /**
   * Get logs by time range
   */
  getLogsByTimeRange(startTime: number, endTime: number): LogContext[] {
    return this.logs.filter(
      l => l.timestamp >= startTime && l.timestamp <= endTime
    );
  }

  /**
   * Clear logs
   */
  clear(): void {
    this.logs = [];
  }
}

/**
 * Health check service
 */
export class HealthCheckService {
  private checks: Map<string, () => Promise<boolean>> = new Map();

  /**
   * Register a health check
   */
  registerCheck(name: string, check: () => Promise<boolean>): void {
    this.checks.set(name, check);
  }

  /**
   * Run all health checks
   */
  async runHealthChecks(): Promise<
    Record<string, { status: 'healthy' | 'unhealthy'; responseTime: number }>
  > {
    const results: Record<
      string,
      { status: 'healthy' | 'unhealthy'; responseTime: number }
    > = {};

    for (const [name, check] of this.checks.entries()) {
      const startTime = Date.now();
      try {
        const isHealthy = await check();
        const responseTime = Date.now() - startTime;

        results[name] = {
          status: isHealthy ? 'healthy' : 'unhealthy',
          responseTime,
        };
      } catch {
        const responseTime = Date.now() - startTime;
        results[name] = {
          status: 'unhealthy',
          responseTime,
        };
      }
    }

    return results;
  }

  /**
   * Get overall health status
   */
  async getOverallHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, unknown>;
  }> {
    const checks = await this.runHealthChecks();
    const healthyChecks = Object.values(checks).filter(
      c => c.status === 'healthy'
    ).length;
    const totalChecks = Object.keys(checks).length;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (healthyChecks === 0) {
      status = 'unhealthy';
    } else if (healthyChecks < totalChecks) {
      status = 'degraded';
    }

    return {
      status,
      details: checks,
    };
  }
}

// Create service instances
export const performanceMonitor = new PerformanceMonitor();
export const loggingService = new LoggingService();
export const healthCheckService = new HealthCheckService();

// Export convenience functions
export const monitoring = {
  // Performance monitoring
  recordMetric: (metric: Omit<PerformanceMetric, 'timestamp'>) =>
    performanceMonitor.recordMetric(metric),

  recordRequestTime: (responseTime: number) =>
    performanceMonitor.recordRequestTime(responseTime),

  recordError: () => performanceMonitor.recordError(),

  getStats: () => performanceMonitor.getStats(),

  // Logging
  log: (
    level: LogContext['level'],
    message: string,
    metadata?: Record<string, unknown>
  ) => loggingService.log(level, message, metadata),

  debug: (message: string, metadata?: Record<string, unknown>) =>
    loggingService.debug(message, metadata),

  info: (message: string, metadata?: Record<string, unknown>) =>
    loggingService.info(message, metadata),

  warn: (message: string, metadata?: Record<string, unknown>) =>
    loggingService.warn(message, metadata),

  error: (message: string, metadata?: Record<string, unknown>) =>
    loggingService.error(message, metadata),

  // Health checks
  registerHealthCheck: (name: string, check: () => Promise<boolean>) =>
    healthCheckService.registerCheck(name, check),

  runHealthChecks: () => healthCheckService.runHealthChecks(),

  getOverallHealth: () => healthCheckService.getOverallHealth(),
};
