import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface FoodGroup {
  id: string;
  name: string;
  category:
    | 'fruits'
    | 'vegetables'
    | 'grains'
    | 'proteins'
    | 'dairy'
    | 'nuts'
    | 'herbs'
    | 'spices';
  subcategory?: string;
  nutrients: string[];
  benefits: string[];
  seasonality?: 'spring' | 'summer' | 'fall' | 'winter' | 'year-round';
  glycemicIndex?: number;
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  fiberPer100g?: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserPreferences {
  userId: string;
  dietaryRestrictions: string[];
  allergies: string[];
  healthGoals: string[];
  preferredCuisines: string[];
  cookingSkill: 'beginner' | 'intermediate' | 'advanced';
  mealPrepTime: 'quick' | 'moderate' | 'extensive';
  servingSize: 'small' | 'medium' | 'large';
  spiceTolerance: 'mild' | 'medium' | 'hot';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SavedCombination {
  id: string;
  userId: string;
  name: string;
  fruits: string[];
  vegetables: string[];
  grains: string[];
  proteins?: string[];
  dairy?: string[];
  nuts?: string[];
  herbs?: string[];
  spices?: string[];
  benefits: string[];
  preparation: string;
  nutritionFacts?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  tags: string[];
  isFavorite: boolean;
  rating?: number;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NutritionGoal {
  id: string;
  userId: string;
  name: string;
  description: string;
  targetNutrients: string[];
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  targetFiber?: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Check if database is available
const checkDb = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

// ============================================================================
// FOOD GROUP OPERATIONS
// ============================================================================

export const foodGroupOperations = {
  // Create a new food group
  async create(
    foodGroup: Omit<FoodGroup, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const database = checkDb();
    const docRef = await addDoc(collection(database, 'foodGroups'), {
      ...foodGroup,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Get all food groups
  async getAll(): Promise<FoodGroup[]> {
    const database = checkDb();
    const querySnapshot = await getDocs(collection(database, 'foodGroups'));
    return querySnapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as FoodGroup
    );
  },

  // Get food groups by category
  async getByCategory(category: FoodGroup['category']): Promise<FoodGroup[]> {
    const database = checkDb();
    const q = query(
      collection(database, 'foodGroups'),
      where('category', '==', category),
      where('isActive', '==', true),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as FoodGroup
    );
  },

  // Get food group by ID
  async getById(id: string): Promise<FoodGroup | null> {
    const database = checkDb();
    const docRef = doc(database, 'foodGroups', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as FoodGroup;
    }
    return null;
  },

  // Update food group
  async update(id: string, updates: Partial<FoodGroup>): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, 'foodGroups', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete food group (soft delete)
  async delete(id: string): Promise<void> {
    await this.update(id, { isActive: false });
  },

  // Search food groups by name or nutrients
  async search(searchTerm: string): Promise<FoodGroup[]> {
    const allGroups = await this.getAll();
    const term = searchTerm.toLowerCase();
    return allGroups.filter(
      group =>
        group.name.toLowerCase().includes(term) ||
        group.nutrients.some(nutrient =>
          nutrient.toLowerCase().includes(term)
        ) ||
        group.benefits.some(benefit => benefit.toLowerCase().includes(term))
    );
  },
};

// ============================================================================
// USER PREFERENCES OPERATIONS
// ============================================================================

export const userPreferencesOperations = {
  // Create or update user preferences
  async upsert(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, 'userPreferences', userId);
    await setDoc(
      docRef,
      {
        userId,
        ...preferences,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },

  // Get user preferences
  async get(userId: string): Promise<UserPreferences | null> {
    const database = checkDb();
    const docRef = doc(database, 'userPreferences', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserPreferences;
    }
    return null;
  },

  // Update specific preference fields
  async update(
    userId: string,
    updates: Partial<UserPreferences>
  ): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, 'userPreferences', userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },
};

// ============================================================================
// SAVED COMBINATIONS OPERATIONS
// ============================================================================

export const savedCombinationsOperations = {
  // Save a new combination
  async save(
    combination: Omit<SavedCombination, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const database = checkDb();
    const docRef = await addDoc(collection(database, 'savedCombinations'), {
      ...combination,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Get combinations by user ID
  async getByUserId(userId: string): Promise<SavedCombination[]> {
    try {
      const database = checkDb();
      const q = query(
        collection(database, 'savedCombinations'),
        where('userId', '==', userId)
        // Removed orderBy to avoid composite index requirement
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SavedCombination[];
    } catch (error) {
      console.error('Error getting combinations by user ID:', error);
      throw error;
    }
  },

  // Get favorite combinations for a user
  async getFavorites(userId: string): Promise<SavedCombination[]> {
    try {
      const database = checkDb();
      const q = query(
        collection(database, 'savedCombinations'),
        where('userId', '==', userId),
        where('isFavorite', '==', true)
        // Removed orderBy to avoid composite index requirement
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SavedCombination[];
    } catch (error) {
      console.error('Error getting favorite combinations:', error);
      throw error;
    }
  },

  // Update combination
  async update(id: string, updates: Partial<SavedCombination>): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, 'savedCombinations', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Toggle favorite status
  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    await this.update(id, { isFavorite });
  },

  // Delete combination
  async delete(id: string): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, 'savedCombinations', id);
    await deleteDoc(docRef);
  },
};

// ============================================================================
// NUTRITION GOALS OPERATIONS
// ============================================================================

export const nutritionGoalsOperations = {
  // Create or update nutrition goal
  async upsert(
    goal: Omit<NutritionGoal, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const database = checkDb();
    const docRef = doc(database, 'nutritionGoals', goal.userId);
    await setDoc(
      docRef,
      {
        ...goal,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return goal.userId;
  },

  // Get user's nutrition goals
  async getByUserId(userId: string): Promise<NutritionGoal[]> {
    const database = checkDb();
    const q = query(
      collection(database, 'nutritionGoals'),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as NutritionGoal
    );
  },

  // Update nutrition goal
  async update(userId: string, updates: Partial<NutritionGoal>): Promise<void> {
    const database = checkDb();
    const docRef = doc(database, 'nutritionGoals', userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const databaseUtils = {
  // Initialize default food groups (run once to populate database)
  async initializeDefaultFoodGroups(): Promise<void> {
    const defaultGroups: Omit<FoodGroup, 'id' | 'createdAt' | 'updatedAt'>[] = [
      // Fruits
      {
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
      },
      {
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
      },
      // Vegetables
      {
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
      },
      // Grains
      {
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
      },
      // Proteins
      {
        name: 'Chicken Breast',
        category: 'proteins',
        subcategory: 'poultry',
        nutrients: ['complete protein', 'vitamin B6', 'niacin', 'selenium'],
        benefits: ['muscle building', 'metabolism', 'immune function'],
        seasonality: 'year-round',
        caloriesPer100g: 165,
        proteinPer100g: 31,
        carbsPer100g: 0,
        fatPer100g: 3.6,
        fiberPer100g: 0,
        isActive: true,
      },
      // Dairy
      {
        name: 'Greek Yogurt',
        category: 'dairy',
        subcategory: 'fermented dairy',
        nutrients: ['protein', 'calcium', 'probiotics', 'vitamin B12'],
        benefits: ['muscle health', 'bone health', 'gut health'],
        seasonality: 'year-round',
        caloriesPer100g: 59,
        proteinPer100g: 10,
        carbsPer100g: 3.6,
        fatPer100g: 0.4,
        fiberPer100g: 0,
        isActive: true,
      },
      // Nuts
      {
        name: 'Almonds',
        category: 'nuts',
        subcategory: 'tree nuts',
        nutrients: ['vitamin E', 'healthy fats', 'protein', 'magnesium'],
        benefits: ['heart health', 'skin health', 'muscle function'],
        seasonality: 'year-round',
        caloriesPer100g: 579,
        proteinPer100g: 21,
        carbsPer100g: 22,
        fatPer100g: 50,
        fiberPer100g: 12.5,
        isActive: true,
      },
      // Herbs
      {
        name: 'Basil',
        category: 'herbs',
        subcategory: 'culinary herbs',
        nutrients: ['vitamin K', 'antioxidants', 'essential oils'],
        benefits: ['anti-inflammatory', 'digestive health', 'immune support'],
        seasonality: 'summer',
        caloriesPer100g: 22,
        proteinPer100g: 3.2,
        carbsPer100g: 2.6,
        fatPer100g: 0.6,
        fiberPer100g: 1.6,
        isActive: true,
      },
      // Spices
      {
        name: 'Turmeric',
        category: 'spices',
        subcategory: 'root spices',
        nutrients: ['curcumin', 'iron', 'manganese', 'vitamin B6'],
        benefits: ['anti-inflammatory', 'antioxidant', 'brain health'],
        seasonality: 'year-round',
        caloriesPer100g: 354,
        proteinPer100g: 8,
        carbsPer100g: 65,
        fatPer100g: 10,
        fiberPer100g: 21,
        isActive: true,
      },
    ];

    for (const group of defaultGroups) {
      try {
        await foodGroupOperations.create(group);
        console.log(`Created food group: ${group.name}`);
      } catch (error) {
        console.error(`Failed to create food group ${group.name}:`, error);
      }
    }
  },
};
