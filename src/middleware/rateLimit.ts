import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  statusCode?: number; // Custom status code
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      ...config,
      windowMs: config.windowMs ?? 15 * 60 * 1000, // 15 minutes default
      maxRequests: config.maxRequests ?? 100, // 100 requests default
      message: config.message ?? 'Too many requests, please try again later.',
      statusCode: config.statusCode ?? 429, // Too Many Requests
    };
  }

  /**
   * Check if request should be rate limited
   */
  private checkRateLimit(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    if (!record || now > record.resetTime) {
      // First request or window expired
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    if (record.count >= this.config.maxRequests) {
      // Rate limit exceeded
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    // Increment counter
    record.count++;
    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  /**
   * Get client identifier (IP address or user ID)
   */
  private getClientIdentifier(request: NextRequest): string {
    // Try to get real IP from headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');

    let ip = 'unknown';

    if (forwardedFor) {
      ip = forwardedFor.split(',')[0].trim();
    } else if (realIp) {
      ip = realIp;
    } else if (cfConnectingIp) {
      ip = cfConnectingIp;
    }

    // Add user agent to make identifier more unique
    const userAgent = request.headers.get('user-agent') || 'unknown';
    return `${ip}-${userAgent}`;
  }

  /**
   * Apply rate limiting to request
   */
  async apply(request: NextRequest): Promise<NextResponse | null> {
    const identifier = this.getClientIdentifier(request);
    const result = this.checkRateLimit(identifier);

    if (!result.allowed) {
      // Rate limit exceeded
      const response = NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: this.config.message,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        { status: this.config.statusCode }
      );

      // Add rate limit headers
      response.headers.set(
        'X-RateLimit-Limit',
        this.config.maxRequests.toString()
      );
      response.headers.set(
        'X-RateLimit-Remaining',
        result.remaining.toString()
      );
      response.headers.set(
        'X-RateLimit-Reset',
        new Date(result.resetTime).toISOString()
      );
      response.headers.set(
        'Retry-After',
        Math.ceil((result.resetTime - Date.now()) / 1000).toString()
      );

      return response;
    }

    // Request allowed, add rate limit headers
    const response = NextResponse.next();
    response.headers.set(
      'X-RateLimit-Limit',
      this.config.maxRequests.toString()
    );
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set(
      'X-RateLimit-Reset',
      new Date(result.resetTime).toISOString()
    );

    return null; // Continue with request
  }
}

// Pre-configured rate limiters for different endpoints
export const rateLimiters = {
  // Strict rate limiting for authentication endpoints
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.',
  }),

  // Moderate rate limiting for API endpoints
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Too many API requests, please try again later.',
  }),

  // Strict rate limiting for AI generation endpoints
  ai: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 AI generations per hour
    message: 'Too many AI generation requests, please try again later.',
  }),

  // Loose rate limiting for public endpoints
  public: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000, // 1000 requests per 15 minutes
    message: 'Too many requests, please try again later.',
  }),
};

// Helper function to apply rate limiting
export async function applyRateLimit(
  request: NextRequest,
  type: keyof typeof rateLimiters = 'api'
): Promise<NextResponse | null> {
  return rateLimiters[type].apply(request);
}

// Clean up expired rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute
