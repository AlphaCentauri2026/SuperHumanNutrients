import { NextRequest, NextResponse } from 'next/server';
import { generateMealPlan, MealPlanRequest } from '@/lib/ai';
import { applyRateLimit } from '@/middleware/rateLimit';
import {
  createSecurityMiddleware,
  secureResponse,
} from '@/middleware/security';
import { MealPlanRequestSchema } from '@/lib/validation/schemas';
import { sanitizeObject } from '@/lib/validation/sanitization';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (strict for AI endpoints)
    const rateLimitResponse = await applyRateLimit(request, 'ai');
    if (rateLimitResponse) return rateLimitResponse;

    // Apply security middleware
    const securityMiddleware = createSecurityMiddleware({
      allowedMethods: ['POST'],
      maxRequestSize: 1024 * 1024, // 1MB
    });
    const securityResponse = await securityMiddleware(request);
    if (securityResponse) return securityResponse;

    // Get the request body
    const body: MealPlanRequest = await request.json();
    console.log('📡 Meal plan request body:', JSON.stringify(body, null, 2));

    // Validate the request using Zod schema
    const validationResult = MealPlanRequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('❌ Validation failed:', validationResult.error.issues);
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

    // Generate the meal plan using the server-side AI function with sanitized data
    const response = await generateMealPlan(sanitizedData);

    if (response.success && response.mealPlan) {
      return secureResponse(
        NextResponse.json({
          success: true,
          mealPlan: response.mealPlan,
        })
      );
    } else {
      return secureResponse(
        NextResponse.json(
          {
            success: false,
            error: response.error || 'Failed to generate meal plan',
          },
          { status: 500 }
        )
      );
    }
  } catch (error) {
    console.error('Meal plan generation error:', error);
    return secureResponse(
      NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
        },
        { status: 500 }
      )
    );
  }
}
