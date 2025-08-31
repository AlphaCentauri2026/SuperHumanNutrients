import { api, ApiResponse } from '../client';
import { MealPlanRequestSchema } from '@/lib/validation/schemas';
import { sanitizeObject } from '@/lib/validation/sanitization';

// Meal plan request interface
export interface MealPlanRequest {
  fruits: string[];
  vegetables: string[];
  grains: string[];
  userPrompt?: string;
  preferences?: string;
  dietaryRestrictions?: string[];
}

// Meal plan response interface
export interface MealPlan {
  id: string;
  title: string;
  description: string;
  meals: Meal[];
  nutritionSummary: NutritionSummary;
  preparationTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  createdAt: string;
  updatedAt: string;
}

// Meal interface
export interface Meal {
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: Ingredient[];
  instructions: string[];
  nutritionFacts: NutritionFacts;
  preparationTime: string;
  cookingTime: string;
}

// Ingredient interface
export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  category: string;
  notes?: string;
}

// Nutrition facts interface
export interface NutritionFacts {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

// Nutrition summary interface
export interface NutritionSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  totalFiber: number;
  dailyValues: {
    protein: number; // percentage of daily value
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
}

// Meal planning service interface
export interface MealPlanningService {
  generateMealPlan(request: MealPlanRequest): Promise<ApiResponse<MealPlan>>;
  saveMealPlan(mealPlan: MealPlan): Promise<ApiResponse<{ id: string }>>;
  getSavedMealPlans(): Promise<ApiResponse<MealPlan[]>>;
  getMealPlanById(id: string): Promise<ApiResponse<MealPlan>>;
  updateMealPlan(
    id: string,
    updates: Partial<MealPlan>
  ): Promise<ApiResponse<{ success: boolean }>>;
  deleteMealPlan(id: string): Promise<ApiResponse<{ success: boolean }>>;
  getMealPlanHistory(): Promise<
    ApiResponse<{ date: string; mealPlan: MealPlan }[]>
  >;
}

// Meal planning service implementation
export class MealPlanningServiceImpl implements MealPlanningService {
  private baseEndpoint = '/api/meal-plan';

  /**
   * Generate meal plan using AI
   */
  async generateMealPlan(
    request: MealPlanRequest
  ): Promise<ApiResponse<MealPlan>> {
    try {
      // Validate request data
      const validationResult = MealPlanRequestSchema.safeParse(request);
      if (!validationResult.success) {
        return {
          success: false,
          error: 'Invalid meal plan request',
          details: validationResult.error.issues,
        };
      }

      // Sanitize request data
      const sanitizedData = sanitizeObject(validationResult.data);

      const response = await api.post<MealPlan>(
        this.baseEndpoint,
        sanitizedData
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate meal plan',
        details: error,
      };
    }
  }

  /**
   * Save meal plan to user's collection
   */
  async saveMealPlan(mealPlan: MealPlan): Promise<ApiResponse<{ id: string }>> {
    try {
      const response = await api.post<{ id: string }>(
        '/api/combinations/save',
        {
          type: 'mealPlan',
          data: mealPlan,
        }
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to save meal plan',
        details: error,
      };
    }
  }

  /**
   * Get user's saved meal plans
   */
  async getSavedMealPlans(): Promise<ApiResponse<MealPlan[]>> {
    try {
      const response = await api.get<MealPlan[]>(
        '/api/combinations/user?type=mealPlan'
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch saved meal plans',
        details: error,
      };
    }
  }

  /**
   * Get meal plan by ID
   */
  async getMealPlanById(id: string): Promise<ApiResponse<MealPlan>> {
    try {
      const response = await api.get<MealPlan>(`/api/combinations/user/${id}`);
      return response;
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch meal plan with ID: ${id}`,
        details: error,
      };
    }
  }

  /**
   * Update existing meal plan
   */
  async updateMealPlan(
    id: string,
    updates: Partial<MealPlan>
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await api.put<{ success: boolean }>(
        `/api/combinations/user/${id}`,
        updates
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: `Failed to update meal plan with ID: ${id}`,
        details: error,
      };
    }
  }

  /**
   * Delete meal plan
   */
  async deleteMealPlan(id: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await api.delete<{ success: boolean }>(
        `/api/combinations/user/${id}`
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete meal plan with ID: ${id}`,
        details: error,
      };
    }
  }

  /**
   * Get meal plan history
   */
  async getMealPlanHistory(): Promise<
    ApiResponse<{ date: string; mealPlan: MealPlan }[]>
  > {
    try {
      const response = await api.get<{ date: string; mealPlan: MealPlan }[]>(
        '/api/combinations/user?type=mealPlan&history=true'
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch meal plan history',
        details: error,
      };
    }
  }

  /**
   * Generate meal plan with custom preferences
   */
  async generateCustomMealPlan(options: {
    foods: MealPlanRequest;
    preferences: {
      cookingTime: 'quick' | 'moderate' | 'extensive';
      difficulty: 'easy' | 'medium' | 'hard';
      servings: number;
      cuisine?: string;
      dietaryRestrictions?: string[];
    };
  }): Promise<ApiResponse<MealPlan>> {
    try {
      const request: MealPlanRequest = {
        ...options.foods,
        preferences: JSON.stringify(options.preferences),
        dietaryRestrictions: options.preferences.dietaryRestrictions,
      };

      return this.generateMealPlan(request);
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate custom meal plan',
        details: error,
      };
    }
  }

  /**
   * Get meal plan suggestions based on available ingredients
   */
  async getMealPlanSuggestions(
    availableIngredients: string[]
  ): Promise<ApiResponse<MealPlan[]>> {
    try {
      const response = await api.post<MealPlan[]>(
        '/api/meal-plan/suggestions',
        {
          ingredients: availableIngredients,
        }
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get meal plan suggestions',
        details: error,
      };
    }
  }

  /**
   * Calculate nutrition totals for a meal plan
   */
  calculateNutritionTotals(mealPlan: MealPlan): NutritionSummary {
    const totals = mealPlan.meals.reduce(
      (acc, meal) => {
        acc.calories += meal.nutritionFacts.calories;
        acc.protein += meal.nutritionFacts.protein;
        acc.carbohydrates += meal.nutritionFacts.carbohydrates;
        acc.fat += meal.nutritionFacts.fat;
        acc.fiber += meal.nutritionFacts.fiber;
        return acc;
      },
      {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
      }
    );

    // Calculate daily value percentages (based on 2000 calorie diet)
    const dailyValues = {
      protein: Math.round((totals.protein / 50) * 100), // 50g daily value
      carbohydrates: Math.round((totals.carbohydrates / 275) * 100), // 275g daily value
      fat: Math.round((totals.fat / 55) * 100), // 55g daily value
      fiber: Math.round((totals.fiber / 28) * 100), // 28g daily value
    };

    return {
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbohydrates: totals.carbohydrates,
      totalFat: totals.fat,
      totalFiber: totals.fiber,
      dailyValues,
    };
  }
}

// Create and export service instance
export const mealPlanningService = new MealPlanningServiceImpl();

// Export convenience functions
export const mealPlanningApi = {
  generate: (request: MealPlanRequest) =>
    mealPlanningService.generateMealPlan(request),
  save: (mealPlan: MealPlan) => mealPlanningService.saveMealPlan(mealPlan),
  getSaved: () => mealPlanningService.getSavedMealPlans(),
  getById: (id: string) => mealPlanningService.getMealPlanById(id),
  update: (id: string, updates: Partial<MealPlan>) =>
    mealPlanningService.updateMealPlan(id, updates),
  delete: (id: string) => mealPlanningService.deleteMealPlan(id),
  getHistory: () => mealPlanningService.getMealPlanHistory(),
  generateCustom: (
    options: Parameters<typeof mealPlanningService.generateCustomMealPlan>[0]
  ) => mealPlanningService.generateCustomMealPlan(options),
  getSuggestions: (ingredients: string[]) =>
    mealPlanningService.getMealPlanSuggestions(ingredients),
  calculateNutrition: (mealPlan: MealPlan) =>
    mealPlanningService.calculateNutritionTotals(mealPlan),
};
