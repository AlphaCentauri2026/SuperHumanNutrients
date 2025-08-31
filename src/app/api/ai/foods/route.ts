import { NextResponse } from 'next/server';
import { foodGroupOperations } from '@/lib/database';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if we're in build mode or if Firebase is not configured
    if (
      !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      (process.env.NODE_ENV === 'production' &&
        !process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
    ) {
      // Return mock data during build or when Firebase is not configured
      return NextResponse.json({
        success: true,
        data: {
          totalFoods: 0,
          categories: {
            fruits: { count: 0, examples: [] },
            vegetables: { count: 0, examples: [] },
            grains: { count: 0, examples: [] },
            superfoods: { count: 0, examples: [] },
            exotic: { count: 0, examples: [] },
          },
        },
      });
    }

    // Get all food groups from the database
    const foodGroups = await foodGroupOperations.getAll();

    // Categorize foods for the AI
    const categorizedFoods = {
      fruits: foodGroups.filter(f =>
        f.category?.toLowerCase().includes('fruit')
      ),
      vegetables: foodGroups.filter(f =>
        f.category?.toLowerCase().includes('vegetable')
      ),
      grains: foodGroups.filter(
        f =>
          f.category?.toLowerCase().includes('grain') ||
          f.category?.toLowerCase().includes('cereal') ||
          f.category?.toLowerCase().includes('carbohydrate')
      ),
      superfoods: foodGroups.filter(
        f =>
          f.benefits?.some(
            benefit =>
              benefit?.toLowerCase().includes('superfood') ||
              benefit?.toLowerCase().includes('antioxidant') ||
              benefit?.toLowerCase().includes('nutrient-dense')
          ) || false
      ),
      exotic: foodGroups.filter(
        f =>
          f.benefits?.some(
            benefit =>
              benefit?.toLowerCase().includes('exotic') ||
              benefit?.toLowerCase().includes('rare') ||
              benefit?.toLowerCase().includes('tropical') ||
              benefit?.toLowerCase().includes('ancient')
          ) || false
      ),
    };

    // Return categorized food data for AI use
    return NextResponse.json({
      success: true,
      data: {
        totalFoods: foodGroups.length,
        categories: {
          fruits: {
            count: categorizedFoods.fruits.length,
            examples: categorizedFoods.fruits.slice(0, 20).map(f => ({
              name: f.name,
              category: f.category,
              description: f.benefits?.join(', ') || 'No description',
              nutritionFacts: {
                calories: f.caloriesPer100g || 0,
                protein: f.proteinPer100g || 0,
                carbs: f.carbsPer100g || 0,
                fat: f.fatPer100g || 0,
                fiber: f.fiberPer100g || 0,
              },
              tags: f.benefits || [],
            })),
          },
          vegetables: {
            count: categorizedFoods.vegetables.length,
            examples: categorizedFoods.vegetables.slice(0, 20).map(f => ({
              name: f.name,
              category: f.category,
              description: f.benefits?.join(', ') || 'No description',
              nutritionFacts: {
                calories: f.caloriesPer100g || 0,
                protein: f.proteinPer100g || 0,
                carbs: f.carbsPer100g || 0,
                fat: f.fatPer100g || 0,
                fiber: f.fiberPer100g || 0,
              },
              tags: f.benefits || [],
            })),
          },
          grains: {
            count: categorizedFoods.grains.length,
            examples: categorizedFoods.grains.slice(0, 20).map(f => ({
              name: f.name,
              category: f.category,
              description: f.benefits?.join(', ') || 'No description',
              nutritionFacts: {
                calories: f.caloriesPer100g || 0,
                protein: f.proteinPer100g || 0,
                carbs: f.carbsPer100g || 0,
                fat: f.fatPer100g || 0,
                fiber: f.fiberPer100g || 0,
              },
              tags: f.benefits || [],
            })),
          },
          superfoods: {
            count: categorizedFoods.superfoods.length,
            examples: categorizedFoods.superfoods.slice(0, 15).map(f => ({
              name: f.name,
              category: f.category,
              description: f.benefits?.join(', ') || 'No description',
              nutritionFacts: {
                calories: f.caloriesPer100g || 0,
                protein: f.proteinPer100g || 0,
                carbs: f.carbsPer100g || 0,
                fat: f.fatPer100g || 0,
                fiber: f.fiberPer100g || 0,
              },
              tags: f.benefits || [],
            })),
          },
          exotic: {
            count: categorizedFoods.exotic.length,
            examples: categorizedFoods.exotic.slice(0, 15).map(f => ({
              name: f.name,
              category: f.category,
              description: f.benefits?.join(', ') || 'No description',
              nutritionFacts: {
                calories: f.caloriesPer100g || 0,
                protein: f.proteinPer100g || 0,
                carbs: f.carbsPer100g || 0,
                fat: f.fatPer100g || 0,
                fiber: f.fiberPer100g || 0,
              },
              tags: f.benefits || [],
            })),
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching foods for AI:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch food data' },
      { status: 500 }
    );
  }
}
