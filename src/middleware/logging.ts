import { NextRequest, NextResponse } from 'next/server';
import { loggingService } from '@/lib/monitoring';

export interface LoggingOptions {
  logRequestBody?: boolean;
  logResponseBody?: boolean;
  logHeaders?: boolean;
  excludePaths?: string[];
}

export function createLoggingMiddleware(options: LoggingOptions = {}) {
  const {
    logRequestBody = false,
    logResponseBody = false,
    logHeaders = false,
    excludePaths = ['/api/health'], // Don't log health checks
  } = options;

  return async function loggingMiddleware(
    request: NextRequest,
    next: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    const url = request.url;
    const method = request.method;
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Skip logging for excluded paths
    if (excludePaths.some(path => url.includes(path))) {
      return next();
    }

    // Log request
    const requestLog: Record<string, unknown> = {
      type: 'request',
      requestId,
      method,
      url,
      userAgent,
      ip,
      timestamp: new Date().toISOString(),
    };

    if (logHeaders) {
      requestLog.headers = Object.fromEntries(request.headers.entries());
    }

    if (logRequestBody && method !== 'GET') {
      try {
        const body = await request.text();
        if (body) {
          requestLog.body = body;
        }
        // Reconstruct the request since we consumed the body
        const newRequest = new NextRequest(request.url, {
          method: request.method,
          headers: request.headers,
          body,
        });
        Object.setPrototypeOf(newRequest, request);
        Object.assign(request, newRequest);
      } catch (error) {
        requestLog.bodyError = 'Failed to read request body';
      }
    }

    loggingService.info('API Request', requestLog);

    try {
      // Process the request
      const response = await next();
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Log response
      const responseLog: Record<string, unknown> = {
        type: 'response',
        requestId,
        method,
        url,
        status: response.status,
        statusText: response.statusText,
        duration,
        timestamp: new Date().toISOString(),
      };

      if (logResponseBody && response.status >= 400) {
        try {
          const responseBody = await response.text();
          if (responseBody) {
            responseLog.body = responseBody;
          }
          // Reconstruct the response since we consumed the body
          const newResponse = new NextResponse(responseBody, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
          Object.setPrototypeOf(newResponse, response);
          Object.assign(response, newResponse);
        } catch (error) {
          responseLog.bodyError = 'Failed to read response body';
        }
      }

      loggingService.info('API Response', responseLog);

      // Add performance header
      response.headers.set('X-Response-Time', `${duration}ms`);
      response.headers.set('X-Request-ID', requestId);

      return response;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Log error
      const errorLog: Record<string, unknown> = {
        type: 'error',
        requestId,
        method,
        url,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        duration,
        timestamp: new Date().toISOString(),
      };

      loggingService.error('API Error', errorLog);

      // Re-throw the error
      throw error;
    }
  };
}

// Convenience function for simple logging
export function withLogging(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options?: LoggingOptions
) {
  return async function (request: NextRequest): Promise<NextResponse> {
    const loggingMiddleware = createLoggingMiddleware(options);
    return loggingMiddleware(request, () => handler(request));
  };
}
