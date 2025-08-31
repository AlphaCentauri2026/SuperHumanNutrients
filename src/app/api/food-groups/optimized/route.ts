import { NextRequest, NextResponse } from 'next/server';
import { foodGroupOperations } from '@/lib/database';
import { getFallbackFoodGroups } from '@/lib/fallbackData';
import { applyRateLimit } from '@/middleware/rateLimit';
import {
  createSecurityMiddleware,
  secureResponse,
} from '@/middleware/security';
import {
  FoodGroupSchema,
  SearchQuerySchema,
  CategoryFilterSchema,
} from '@/lib/validation/schemas';
import { sanitizeInput, sanitizeObject } from '@/lib/validation/sanitization';
import { cache } from '@/lib/cache';
import { monitoring } from '@/lib/monitoring';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

// Cache configuration
const CACHE_TTL = 1800; // 30 minutes
const CACHE_PREFIX = 'food-groups';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Apply security middleware
    const securityMiddleware = createSecurityMiddleware({
      allowedMethods: ['GET'],
      maxRequestSize: 1024 * 1024, // 1MB
    });
    const securityResponse = await securityMiddleware(request);
    if (securityResponse) return securityResponse;

    monitoring.info('Food groups API called', { timestamp: startTime });

    const { searchParams } = new URL(request.url);

    // Validate and sanitize query parameters
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    // Validate category parameter
    if (categoryParam) {
      const categoryValidation = CategoryFilterSchema.safeParse(categoryParam);
      if (!categoryValidation.success) {
        monitoring.error('Invalid category parameter', {
          category: categoryParam,
          errors: categoryValidation.error.issues,
        });

        return secureResponse(
          NextResponse.json(
            {
              success: false,
              error: 'Invalid category parameter',
              details: categoryValidation.error.issues,
            },
            { status: 400 }
          )
        );
      }
    }

    // Validate search parameter
    if (searchParam) {
      const searchValidation = SearchQuerySchema.safeParse(searchParam);
      if (!searchValidation.success) {
        monitoring.error('Invalid search parameter', {
          search: searchParam,
          errors: searchValidation.error.issues,
        });

        return secureResponse(
          NextResponse.json(
            {
              success: false,
              error: 'Invalid search parameter',
              details: searchValidation.error.issues,
            },
            { status: 400 }
          )
        );
      }
    }

    // Sanitize parameters
    const category = categoryParam ? sanitizeInput(categoryParam) : null;
    const search = searchParam ? sanitizeInput(searchParam) : null;

    monitoring.info('Food groups API parameters', { category, search });

    // Generate cache key
    const cacheKey = `query:${category || 'all'}:${search || 'none'}`;

    // Try to get from cache first
    const cachedData = await cache.get(CACHE_PREFIX, cacheKey);
    if (cachedData) {
      monitoring.info('Cache hit for food groups', { cacheKey });
      monitoring.recordMetric({
        name: 'cache_hit',
        value: 1,
        unit: 'count',
        tags: { endpoint: 'food-groups', type: 'cache_hit' },
      });

      const responseTime = Date.now() - startTime;
      monitoring.recordRequestTime(responseTime);

      return secureResponse(
        NextResponse.json({
          success: true,
          data: cachedData,
          count: Array.isArray(cachedData) ? cachedData.length : 0,
          cached: true,
          responseTime,
        })
      );
    }

    monitoring.info('Cache miss for food groups, fetching from database', {
      cacheKey,
    });

    let foodGroups;

    try {
      if (search) {
        monitoring.info('Searching food groups', { query: search });
        foodGroups = await foodGroupOperations.search(search);
      } else if (category) {
        monitoring.info('Getting food groups by category', { category });
        foodGroups = await foodGroupOperations.getByCategory(
          category as
            | 'fruits'
            | 'vegetables'
            | 'grains'
            | 'proteins'
            | 'dairy'
            | 'nuts'
            | 'herbs'
            | 'spices'
        );
      } else {
        monitoring.info('Getting all food groups');
        foodGroups = await foodGroupOperations.getAll();
      }

      monitoring.info('Successfully retrieved food groups from database', {
        count: foodGroups.length,
        category,
        search,
      });

      // Cache the results
      await cache.set(CACHE_PREFIX, cacheKey, foodGroups, CACHE_TTL);
      monitoring.info('Cached food groups data', { cacheKey, ttl: CACHE_TTL });

      const responseTime = Date.now() - startTime;
      monitoring.recordRequestTime(responseTime);
      monitoring.recordMetric({
        name: 'database_query_success',
        value: responseTime,
        unit: 'ms',
        tags: { endpoint: 'food-groups', operation: 'fetch' },
      });

      return secureResponse(
        NextResponse.json({
          success: true,
          data: foodGroups,
          count: foodGroups.length,
          cached: false,
          responseTime,
        })
      );
    } catch (dbError) {
      monitoring.error('Database operation failed, using fallback data', {
        error: dbError instanceof Error ? dbError.message : 'Unknown error',
        category,
        search,
      });

      // Use fallback data when Firebase fails
      if (search) {
        foodGroups = getFallbackFoodGroups(undefined, search);
      } else if (category) {
        foodGroups = getFallbackFoodGroups(category);
      } else {
        foodGroups = getFallbackFoodGroups();
      }

      monitoring.info('Using fallback data', {
        count: foodGroups.length,
        fallback: true,
      });

      // Cache fallback data with shorter TTL
      await cache.set(CACHE_PREFIX, cacheKey, foodGroups, 300); // 5 minutes

      const responseTime = Date.now() - startTime;
      monitoring.recordRequestTime(responseTime);
      monitoring.recordMetric({
        name: 'fallback_data_used',
        value: 1,
        unit: 'count',
        tags: { endpoint: 'food-groups', type: 'fallback' },
      });

      return secureResponse(
        NextResponse.json({
          success: true,
          data: foodGroups,
          count: foodGroups.length,
          fallback: true,
          cached: false,
          message: 'Using fallback data - Firebase not available',
          responseTime,
        })
      );
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    monitoring.error('Error fetching food groups', {
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
      stack: error instanceof Error ? error.stack : undefined,
    });

    monitoring.recordError();
    monitoring.recordMetric({
      name: 'api_error',
      value: 1,
      unit: 'count',
      tags: { endpoint: 'food-groups', type: 'error' },
    });

    return secureResponse(
      NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch food groups',
          details: error instanceof Error ? error.message : 'Unknown error',
          responseTime,
        },
        { status: 500 }
      )
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    // Apply security middleware
    const securityMiddleware = createSecurityMiddleware({
      allowedMethods: ['POST'],
      maxRequestSize: 1024 * 1024, // 1MB
    });
    const securityResponse = await securityMiddleware(request);
    if (securityResponse) return securityResponse;

    const body = await request.json();

    // Validate request body using Zod schema
    const validationResult = FoodGroupSchema.safeParse(body);
    if (!validationResult.success) {
      monitoring.error('Invalid food group data', {
        errors: validationResult.error.issues,
      });

      return secureResponse(
        NextResponse.json(
          {
            success: false,
            error: 'Invalid request data',
            details: validationResult.error.issues,
          },
          { status: 400 }
        )
      );
    }

    // Sanitize the validated data
    const sanitizedData = sanitizeObject(validationResult.data);

    monitoring.info('Creating new food group', {
      name: sanitizedData.name,
      category: sanitizedData.category,
    });

    // Create new food group using sanitized data
    const foodGroupId = await foodGroupOperations.create(sanitizedData);

    // Clear cache for this category to ensure fresh data
    await cache.clearPrefix(CACHE_PREFIX);

    monitoring.info('Food group created successfully', {
      id: foodGroupId,
      name: sanitizedData.name,
    });

    const responseTime = Date.now() - startTime;
    monitoring.recordRequestTime(responseTime);
    monitoring.recordMetric({
      name: 'food_group_created',
      value: 1,
      unit: 'count',
      tags: { endpoint: 'food-groups', operation: 'create' },
    });

    return secureResponse(
      NextResponse.json(
        {
          success: true,
          message: 'Food group created successfully',
          id: foodGroupId,
          responseTime,
        },
        { status: 201 }
      )
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;
    monitoring.error('Error creating food group', {
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
      stack: error instanceof Error ? error.stack : undefined,
    });

    monitoring.recordError();
    monitoring.recordMetric({
      name: 'api_error',
      value: 1,
      unit: 'count',
      tags: { endpoint: 'food-groups', operation: 'create' },
    });

    return secureResponse(
      NextResponse.json(
        {
          success: false,
          error: 'Failed to create food group',
          details: error instanceof Error ? error.message : 'Unknown error',
          responseTime,
        },
        { status: 500 }
      )
    );
  }
}
