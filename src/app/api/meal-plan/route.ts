import { NextRequest, NextResponse } from 'next/server';
import { generateMealPlan, MealPlanRequest } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body: MealPlanRequest = await request.json();

    // Validate the request
    if (
      !body.userPrompt &&
      body.fruits.length === 0 &&
      body.vegetables.length === 0 &&
      body.grains.length === 0
    ) {
      return NextResponse.json(
        {
          error: 'Please provide either a nutrition goal or select food items',
        },
        { status: 400 }
      );
    }

    // Generate the meal plan using the server-side AI function
    const response = await generateMealPlan(body);

    if (response.success && response.mealPlan) {
      return NextResponse.json({
        success: true,
        mealPlan: response.mealPlan,
      });
    } else {
      return NextResponse.json(
        { error: response.error || 'Failed to generate meal plan' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Meal plan generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
