import { FoodGroup } from './database';

// Create a fallback FoodGroup type without the complex timestamp types
type FallbackFoodGroup = Omit<FoodGroup, 'createdAt' | 'updatedAt'> & {
  createdAt: unknown;
  updatedAt: unknown;
};

// Fallback food data when Firebase is not available
export const fallbackFoodGroups: FallbackFoodGroup[] = [
  // Fruits
  {
    id: 'fallback-apple',
    name: 'Apple',
    category: 'fruits',
    subcategory: 'pome',
    nutrients: ['vitamin C', 'fiber', 'antioxidants'],
    benefits: ['heart health', 'digestive health', 'immune support'],
    seasonality: 'fall',
    glycemicIndex: 36,
    caloriesPer100g: 52,
    proteinPer100g: 0.3,
    carbsPer100g: 14,
    fatPer100g: 0.2,
    fiberPer100g: 2.4,
    isActive: true,
    createdAt: new Date() as unknown,
    updatedAt: new Date() as unknown,
  },
  {
    id: 'fallback-banana',
    name: 'Banana',
    category: 'fruits',
    subcategory: 'tropical',
    nutrients: ['potassium', 'vitamin B6', 'fiber'],
    benefits: ['muscle function', 'energy production', 'digestive health'],
    seasonality: 'year-round',
    glycemicIndex: 51,
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 23,
    fatPer100g: 0.3,
    fiberPer100g: 2.6,
    isActive: true,
    createdAt: new Date() as unknown,
    updatedAt: new Date() as unknown,
  },
  {
    id: 'fallback-orange',
    name: 'Orange',
    category: 'fruits',
    subcategory: 'citrus',
    nutrients: ['vitamin C', 'folate', 'potassium'],
    benefits: ['immune support', 'heart health', 'skin health'],
    seasonality: 'winter',
    glycemicIndex: 43,
    caloriesPer100g: 47,
    proteinPer100g: 0.9,
    carbsPer100g: 12,
    fatPer100g: 0.1,
    fiberPer100g: 2.4,
    isActive: true,
    createdAt: new Date() as unknown,
    updatedAt: new Date() as unknown,
  },

  // Vegetables
  {
    id: 'fallback-spinach',
    name: 'Spinach',
    category: 'vegetables',
    subcategory: 'leafy greens',
    nutrients: ['iron', 'vitamin K', 'folate', 'antioxidants'],
    benefits: ['bone health', 'blood health', 'eye health'],
    seasonality: 'spring',
    caloriesPer100g: 23,
    proteinPer100g: 2.9,
    carbsPer100g: 3.6,
    fatPer100g: 0.4,
    fiberPer100g: 2.2,
    isActive: true,
    createdAt: new Date() as unknown,
    updatedAt: new Date() as unknown,
  },
  {
    id: 'fallback-broccoli',
    name: 'Broccoli',
    category: 'vegetables',
    subcategory: 'cruciferous',
    nutrients: ['vitamin C', 'vitamin K', 'fiber', 'sulforaphane'],
    benefits: ['immune support', 'bone health', 'cancer prevention'],
    seasonality: 'fall',
    caloriesPer100g: 34,
    proteinPer100g: 2.8,
    carbsPer100g: 7,
    fatPer100g: 0.4,
    fiberPer100g: 2.6,
    isActive: true,
    createdAt: new Date() as unknown,
    updatedAt: new Date() as unknown,
  },
  {
    id: 'fallback-carrot',
    name: 'Carrot',
    category: 'vegetables',
    subcategory: 'root',
    nutrients: ['beta carotene', 'vitamin A', 'fiber'],
    benefits: ['eye health', 'skin health', 'immune support'],
    seasonality: 'fall',
    caloriesPer100g: 41,
    proteinPer100g: 0.9,
    carbsPer100g: 10,
    fatPer100g: 0.2,
    fiberPer100g: 2.8,
    isActive: true,
    createdAt: new Date() as unknown,
    updatedAt: new Date() as unknown,
  },

  // Grains
  {
    id: 'fallback-quinoa',
    name: 'Quinoa',
    category: 'grains',
    subcategory: 'pseudocereal',
    nutrients: ['complete protein', 'fiber', 'magnesium', 'iron'],
    benefits: ['muscle building', 'digestive health', 'energy production'],
    seasonality: 'year-round',
    glycemicIndex: 53,
    caloriesPer100g: 120,
    proteinPer100g: 4.4,
    carbsPer100g: 22,
    fatPer100g: 1.9,
    fiberPer100g: 2.8,
    isActive: true,
    createdAt: new Date() as unknown,
    updatedAt: new Date() as unknown,
  },
  {
    id: 'fallback-brown-rice',
    name: 'Brown Rice',
    category: 'grains',
    subcategory: 'whole grain',
    nutrients: ['B vitamins', 'fiber', 'magnesium', 'selenium'],
    benefits: ['energy production', 'digestive health', 'heart health'],
    seasonality: 'year-round',
    glycemicIndex: 68,
    caloriesPer100g: 111,
    proteinPer100g: 2.6,
    carbsPer100g: 23,
    fatPer100g: 0.9,
    fiberPer100g: 1.8,
    isActive: true,
    createdAt: new Date() as unknown,
    updatedAt: new Date() as unknown,
  },
  {
    id: 'fallback-oats',
    name: 'Oats',
    category: 'grains',
    subcategory: 'whole grain',
    nutrients: ['beta glucan', 'fiber', 'protein', 'iron'],
    benefits: ['heart health', 'digestive health', 'blood sugar control'],
    seasonality: 'year-round',
    glycemicIndex: 55,
    caloriesPer100g: 389,
    proteinPer100g: 17,
    carbsPer100g: 66,
    fatPer100g: 7,
    fiberPer100g: 10.6,
    isActive: true,
    createdAt: new Date() as unknown,
    updatedAt: new Date() as unknown,
  },
];

export const getFallbackFoodGroups = (
  category?: string,
  search?: string
): FallbackFoodGroup[] => {
  let filtered = fallbackFoodGroups;

  if (category) {
    filtered = filtered.filter(food => food.category === category);
  }

  if (search) {
    const searchTerm = search.toLowerCase();
    filtered = filtered.filter(
      food =>
        food.name.toLowerCase().includes(searchTerm) ||
        food.nutrients.some(nutrient =>
          nutrient.toLowerCase().includes(searchTerm)
        ) ||
        food.benefits.some(benefit =>
          benefit.toLowerCase().includes(searchTerm)
        )
    );
  }

  return filtered;
};
