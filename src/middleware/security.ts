import { NextRequest, NextResponse } from 'next/server';

/**
 * Security headers middleware
 * Protects against XSS, clickjacking, MIME sniffing, and other attacks
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy - prevents XSS attacks
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://www.googleapis.com https://identitytoolkit.googleapis.com",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      'upgrade-insecure-requests',
    ].join('; ')
  );

  // X-Frame-Options - prevents clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // X-Content-Type-Options - prevents MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection - additional XSS protection for older browsers
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy - controls referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy - controls browser features
  response.headers.set(
    'Permissions-Policy',
    [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ].join(', ')
  );

  // Strict-Transport-Security - enforces HTTPS
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // Cache-Control - prevents caching of sensitive data
  response.headers.set(
    'Cache-Control',
    'no-cache, no-store, must-revalidate, max-age=0'
  );

  // Pragma - HTTP/1.0 cache control
  response.headers.set('Pragma', 'no-cache');

  // Expires - cache expiration
  response.headers.set('Expires', '0');

  return response;
}

/**
 * CORS configuration for API routes
 */
export function applyCORS(
  response: NextResponse,
  allowedOrigins: string[] = []
): NextResponse {
  const origin = allowedOrigins.length > 0 ? allowedOrigins.join(', ') : '*';

  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  return response;
}

/**
 * Request size limiting
 */
export function validateRequestSize(
  request: NextRequest,
  maxSize: number = 1024 * 1024
): NextResponse | null {
  const contentLength = request.headers.get('content-length');

  if (contentLength && parseInt(contentLength) > maxSize) {
    return NextResponse.json(
      {
        error: 'Request too large',
        message: `Request size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      },
      { status: 413 } // Payload Too Large
    );
  }

  return null;
}

/**
 * Validate request method
 */
export function validateRequestMethod(
  request: NextRequest,
  allowedMethods: string[]
): NextResponse | null {
  if (!allowedMethods.includes(request.method)) {
    return NextResponse.json(
      {
        error: 'Method not allowed',
        message: `Method ${request.method} is not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
      },
      { status: 405 } // Method Not Allowed
    );
  }

  return null;
}

/**
 * Security middleware factory
 */
export function createSecurityMiddleware(
  options: {
    maxRequestSize?: number;
    allowedMethods?: string[];
    allowedOrigins?: string[];
    enableCORS?: boolean;
  } = {}
) {
  const {
    maxRequestSize = 1024 * 1024, // 1MB default
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
    allowedOrigins: _allowedOrigins = [],
    enableCORS: _enableCORS = false,
  } = options;

  return async function securityMiddleware(
    request: NextRequest
  ): Promise<NextResponse | null> {
    // Check request size
    const sizeCheck = validateRequestSize(request, maxRequestSize);
    if (sizeCheck) return sizeCheck;

    // Check request method
    const methodCheck = validateRequestMethod(request, allowedMethods);
    if (methodCheck) return methodCheck;

    // Continue with request
    return null;
  };
}

/**
 * Apply security to response
 */
export function secureResponse(
  response: NextResponse,
  options: {
    enableCORS?: boolean;
    allowedOrigins?: string[];
  } = {}
): NextResponse {
  // Apply security headers
  response = applySecurityHeaders(response);

  // Apply CORS if enabled
  if (options.enableCORS) {
    response = applyCORS(response, options.allowedOrigins);
  }

  return response;
}
