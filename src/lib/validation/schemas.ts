import { z } from 'zod';

// Base validation schemas
export const BaseStringSchema = z
  .string()
  .min(1, 'Field cannot be empty')
  .max(1000, 'Field too long')
  .trim();

export const BaseNumberSchema = z
  .number()
  .min(0, 'Value must be positive')
  .max(10000, 'Value too large');

// Food-related schemas
export const FoodCategorySchema = z.enum([
  'fruits',
  'vegetables',
  'grains',
  'proteins',
  'dairy',
  'nuts',
  'herbs',
  'spices',
]);

export const SeasonalitySchema = z.enum([
  'spring',
  'summer',
  'fall',
  'winter',
  'year-round',
]);

export const FoodGroupSchema = z.object({
  name: BaseStringSchema.min(1, 'Name is required').max(100, 'Name too long'),
  category: FoodCategorySchema,
  subcategory: BaseStringSchema.max(100).optional(),
  nutrients: z
    .array(BaseStringSchema.max(100))
    .min(1, 'At least one nutrient required')
    .max(50),
  benefits: z
    .array(BaseStringSchema.max(200))
    .min(1, 'At least one benefit required')
    .max(50),
  seasonality: SeasonalitySchema.optional(),
  glycemicIndex: BaseNumberSchema.max(100).optional(),
  caloriesPer100g: BaseNumberSchema.max(1000).optional(),
  proteinPer100g: BaseNumberSchema.max(100).optional(),
  carbsPer100g: BaseNumberSchema.max(100).optional(),
  fatPer100g: BaseNumberSchema.max(100).optional(),
  fiberPer100g: BaseNumberSchema.max(100).optional(),
  isActive: z.boolean().default(true),
});

// User preference schemas
export const DietaryRestrictionSchema = z.enum([
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Low-Carb',
  'Keto',
  'Paleo',
  'Mediterranean',
]);

export const UserPreferencesSchema = z.object({
  dietaryRestrictions: z.array(DietaryRestrictionSchema).max(10),
  allergies: z.array(BaseStringSchema.max(100)).max(20),
  healthGoals: z.array(BaseStringSchema.max(200)).max(10),
  preferredCuisines: z.array(BaseStringSchema.max(100)).max(10),
  cookingSkill: z.enum(['beginner', 'intermediate', 'advanced']),
  mealPrepTime: z.enum(['quick', 'moderate', 'extensive']),
  servingSize: z.enum(['small', 'medium', 'large']),
  spiceTolerance: z.enum(['mild', 'medium', 'hot']),
});

// Meal planning schemas
export const MealPlanRequestSchema = z.object({
  fruits: z.array(z.string().min(1).max(100)).max(20),
  vegetables: z.array(z.string().min(1).max(100)).max(20),
  grains: z.array(z.string().min(1).max(100)).max(20),
  userPrompt: z.string().min(1).max(500).optional(),
  preferences: z.string().min(1).max(1000).optional(),
  dietaryRestrictions: z.array(DietaryRestrictionSchema).max(10).optional(),
});

// Search and filter schemas
export const SearchQuerySchema = BaseStringSchema.max(200);
export const CategoryFilterSchema = FoodCategorySchema.optional();

// API request schemas
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// User authentication schemas
export const UserProfileSchema = z.object({
  displayName: BaseStringSchema.max(100).optional(),
  email: z.string().email('Invalid email format').max(255),
  photoURL: z.string().url('Invalid URL format').max(500).optional(),
});

// Admin operation schemas
export const AdminActionSchema = z.object({
  action: z.enum(['create', 'update', 'delete', 'export', 'import']),
  resource: z.enum(['foodGroups', 'users', 'mealPlans', 'analytics']),
  data: z.record(z.string(), z.unknown()).optional(),
  reason: BaseStringSchema.max(500).optional(),
});

// Export all schemas
export const ValidationSchemas = {
  FoodGroup: FoodGroupSchema,
  UserPreferences: UserPreferencesSchema,
  MealPlanRequest: MealPlanRequestSchema,
  SearchQuery: SearchQuerySchema,
  CategoryFilter: CategoryFilterSchema,
  Pagination: PaginationSchema,
  UserProfile: UserProfileSchema,
  AdminAction: AdminActionSchema,
} as const;

// Type exports for use in components
export type ValidatedFoodGroup = z.infer<typeof FoodGroupSchema>;
export type ValidatedUserPreferences = z.infer<typeof UserPreferencesSchema>;
export type ValidatedMealPlanRequest = z.infer<typeof MealPlanRequestSchema>;
export type ValidatedUserProfile = z.infer<typeof UserProfileSchema>;
export type ValidatedAdminAction = z.infer<typeof AdminActionSchema>;
