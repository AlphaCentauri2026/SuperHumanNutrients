import { useState, useCallback } from 'react';
import {
  FoodGroup,
  UserPreferences,
  SavedCombination,
  NutritionGoal,
  foodGroupOperations,
  userPreferencesOperations,
  savedCombinationsOperations,
  nutritionGoalsOperations,
} from '@/lib/database';

export function useDatabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Food Groups
  const getFoodGroups = useCallback(
    async (category?: string, search?: string) => {
      setLoading(true);
      setError(null);

      try {
        let url = '/api/food-groups';
        const params = new URLSearchParams();

        if (category) params.append('category', category);
        if (search) params.append('search', search);

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          return data.data;
        } else {
          throw new Error(data.error || 'Failed to fetch food groups');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createFoodGroup = useCallback(
    async (foodGroup: Omit<FoodGroup, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/food-groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(foodGroup),
        });

        const data = await response.json();

        if (data.success) {
          return data.id;
        } else {
          throw new Error(data.error || 'Failed to create food group');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // User Preferences
  const getUserPreferences = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/preferences?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch user preferences');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveUserPreferences = useCallback(
    async (userId: string, preferences: Partial<UserPreferences>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/user/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, ...preferences }),
        });

        const data = await response.json();

        if (data.success) {
          return true;
        } else {
          throw new Error(data.error || 'Failed to save user preferences');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateUserPreferences = useCallback(
    async (userId: string, updates: Partial<UserPreferences>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/user/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, ...updates }),
        });

        const data = await response.json();

        if (data.success) {
          return true;
        } else {
          throw new Error(data.error || 'Failed to update user preferences');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Saved Combinations
  const saveCombination = useCallback(
    async (
      combination: Omit<SavedCombination, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/combinations/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(combination),
        });

        const data = await response.json();

        if (data.success) {
          return data.id;
        } else {
          throw new Error(data.error || 'Failed to save combination');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getUserCombinations = useCallback(
    async (userId: string, favoritesOnly = false) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/combinations/user?userId=${userId}&favorites=${favoritesOnly}`
        );
        const data = await response.json();

        if (data.success) {
          return data.data;
        } else {
          throw new Error(data.error || 'Failed to fetch user combinations');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteCombination = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      // This would need a separate API endpoint, but for now we'll use the database operations directly
      await savedCombinationsOperations.delete(id);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(
    async (id: string, isFavorite: boolean) => {
      setLoading(true);
      setError(null);

      try {
        // This would need a separate API endpoint, but for now we'll use the database operations directly
        await savedCombinationsOperations.toggleFavorite(id, isFavorite);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Nutrition Goals
  const saveNutritionGoal = useCallback(
    async (goal: Omit<NutritionGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true);
      setError(null);

      try {
        // This would need a separate API endpoint, but for now we'll use the database operations directly
        const goalId = await nutritionGoalsOperations.upsert(goal);
        return goalId;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getUserNutritionGoals = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const goals = await nutritionGoalsOperations.getByUserId(userId);
      return goals;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,

    // Actions
    getFoodGroups,
    createFoodGroup,
    getUserPreferences,
    saveUserPreferences,
    updateUserPreferences,
    saveCombination,
    getUserCombinations,
    deleteCombination,
    toggleFavorite,
    saveNutritionGoal,
    getUserNutritionGoals,
    clearError,
  };
}
