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

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    console.log('[food-groups] API called');
    const { searchParams } = new URL(request.url);

    // Validate and sanitize query parameters
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    // Validate category parameter
    if (categoryParam) {
      const categoryValidation = CategoryFilterSchema.safeParse(categoryParam);
      if (!categoryValidation.success) {
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

    console.log('[food-groups] Params:', { category, search });

    let foodGroups;

    try {
      if (search) {
        console.log('[food-groups] Searching for:', search);
        // Search across all food groups
        foodGroups = await foodGroupOperations.search(search);
      } else if (category) {
        console.log('[food-groups] Getting category:', category);
        // Get food groups by specific category
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
        console.log('[food-groups] Getting all food groups');
        // Get all food groups
        foodGroups = await foodGroupOperations.getAll();
      }

      console.log(
        '[food-groups] Successfully retrieved',
        foodGroups.length,
        'food groups'
      );

      return secureResponse(
        NextResponse.json({
          success: true,
          data: foodGroups,
          count: foodGroups.length,
        })
      );
    } catch (dbError) {
      console.error(
        '[food-groups] Database operation failed, using fallback data:',
        dbError
      );

      // Use fallback data when Firebase fails
      if (search) {
        foodGroups = getFallbackFoodGroups(undefined, search);
      } else if (category) {
        foodGroups = getFallbackFoodGroups(category);
      } else {
        foodGroups = getFallbackFoodGroups();
      }

      console.log(
        '[food-groups] Using fallback data:',
        foodGroups.length,
        'food groups'
      );

      return secureResponse(
        NextResponse.json({
          success: true,
          data: foodGroups,
          count: foodGroups.length,
          fallback: true,
          message: 'Using fallback data - Firebase not available',
        })
      );
    }
  } catch (error) {
    console.error('[food-groups] Error fetching food groups:', error);
    console.error(
      '[food-groups] Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );
    return secureResponse(
      NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch food groups',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Create new food group using sanitized data
    const foodGroupId = await foodGroupOperations.create(sanitizedData);

    return secureResponse(
      NextResponse.json(
        {
          success: true,
          message: 'Food group created successfully',
          id: foodGroupId,
        },
        { status: 201 }
      )
    );
  } catch (error) {
    console.error('Error creating food group:', error);
    return secureResponse(
      NextResponse.json(
        {
          success: false,
          error: 'Failed to create food group',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    );
  }
}
