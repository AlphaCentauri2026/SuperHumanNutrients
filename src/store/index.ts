import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';
import { User } from 'firebase/auth';
import { FoodGroup } from '@/lib/database';

// Core application state interface
interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;

  // Food data state
  foodGroups: FoodGroup[];
  foodGroupsLoading: boolean;
  foodGroupsError: string | null;

  // Meal planning state
  selectedFoods: {
    fruits: string[];
    vegetables: string[];
    grains: string[];
  };
  mealPlan: unknown | null;
  mealPlanLoading: boolean;
  mealPlanError: string | null;

  // UI state
  sidebarOpen: boolean;
  currentPage: string;
  notifications: Notification[];

  // Search and filters
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: 'name' | 'category' | 'calories';
  sortOrder: 'asc' | 'desc';
}

// Actions interface
interface AppActions {
  // User actions
  setUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;
  logout: () => void;

  // Food data actions
  setFoodGroups: (foodGroups: FoodGroup[]) => void;
  setFoodGroupsLoading: (loading: boolean) => void;
  setFoodGroupsError: (error: string | null) => void;
  addFoodGroup: (foodGroup: FoodGroup) => void;
  updateFoodGroup: (id: string, updates: Partial<FoodGroup>) => void;
  deleteFoodGroup: (id: string) => void;

  // Meal planning actions
  setSelectedFoods: (foods: Partial<AppState['selectedFoods']>) => void;
  addSelectedFood: (
    category: keyof AppState['selectedFoods'],
    food: string
  ) => void;
  removeSelectedFood: (
    category: keyof AppState['selectedFoods'],
    food: string
  ) => void;
  clearSelectedFoods: () => void;
  setMealPlan: (mealPlan: unknown) => void;
  setMealPlanLoading: (loading: boolean) => void;
  setMealPlanError: (error: string | null) => void;

  // UI actions
  setSidebarOpen: (open: boolean) => void;
  setCurrentPage: (page: string) => void;
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Search and filter actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSortBy: (sortBy: AppState['sortBy']) => void;
  setSortOrder: (order: AppState['sortOrder']) => void;
  resetFilters: () => void;
}

// Notification interface
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  duration?: number; // Auto-dismiss after duration (ms)
}

// Combined store type
type AppStore = AppState & AppActions;

// Initial state
const initialState: AppState = {
  // User state
  user: null,
  isAuthenticated: false,
  authLoading: true,

  // Food data state
  foodGroups: [],
  foodGroupsLoading: false,
  foodGroupsError: null,

  // Meal planning state
  selectedFoods: {
    fruits: [],
    vegetables: [],
    grains: [],
  },
  mealPlan: null,
  mealPlanLoading: false,
  mealPlanError: null,

  // UI state
  sidebarOpen: false,
  currentPage: 'home',
  notifications: [],

  // Search and filters
  searchQuery: '',
  selectedCategory: null,
  sortBy: 'name',
  sortOrder: 'asc',
};

// Create the store
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // User actions
        setUser: user =>
          set(state => {
            state.user = user;
            state.isAuthenticated = !!user;
            state.authLoading = false;
          }),

        setAuthLoading: loading =>
          set(state => {
            state.authLoading = loading;
          }),

        logout: () =>
          set(state => {
            state.user = null;
            state.isAuthenticated = false;
            state.authLoading = false;
            state.selectedFoods = initialState.selectedFoods;
            state.mealPlan = null;
          }),

        // Food data actions
        setFoodGroups: foodGroups =>
          set(state => {
            state.foodGroups = foodGroups;
            state.foodGroupsLoading = false;
            state.foodGroupsError = null;
          }),

        setFoodGroupsLoading: loading =>
          set(state => {
            state.foodGroupsLoading = loading;
          }),

        setFoodGroupsError: error =>
          set(state => {
            state.foodGroupsError = error;
            state.foodGroupsLoading = false;
          }),

        addFoodGroup: foodGroup =>
          set(state => {
            state.foodGroups.push(foodGroup);
          }),

        updateFoodGroup: (id, updates) =>
          set(state => {
            const index = state.foodGroups.findIndex(fg => fg.id === id);
            if (index !== -1) {
              Object.assign(state.foodGroups[index], updates);
            }
          }),

        deleteFoodGroup: id =>
          set(state => {
            state.foodGroups = state.foodGroups.filter(fg => fg.id !== id);
          }),

        // Meal planning actions
        setSelectedFoods: foods =>
          set(state => {
            Object.assign(state.selectedFoods, foods);
          }),

        addSelectedFood: (category, food) =>
          set(state => {
            if (!state.selectedFoods[category].includes(food)) {
              state.selectedFoods[category].push(food);
            }
          }),

        removeSelectedFood: (category, food) =>
          set(state => {
            state.selectedFoods[category] = state.selectedFoods[
              category
            ].filter(f => f !== food);
          }),

        clearSelectedFoods: () =>
          set(state => {
            state.selectedFoods = initialState.selectedFoods;
          }),

        setMealPlan: mealPlan =>
          set(state => {
            state.mealPlan = mealPlan;
            state.mealPlanLoading = false;
            state.mealPlanError = null;
          }),

        setMealPlanLoading: loading =>
          set(state => {
            state.mealPlanLoading = loading;
          }),

        setMealPlanError: error =>
          set(state => {
            state.mealPlanError = error;
            state.mealPlanLoading = false;
          }),

        // UI actions
        setSidebarOpen: open =>
          set(state => {
            state.sidebarOpen = open;
          }),

        setCurrentPage: page =>
          set(state => {
            state.currentPage = page;
          }),

        addNotification: notification =>
          set(state => {
            const newNotification: Notification = {
              ...notification,
              id: Math.random().toString(36).substr(2, 9),
              timestamp: Date.now(),
            };
            state.notifications.push(newNotification);

            // Auto-dismiss if duration is set
            if (newNotification.duration) {
              setTimeout(() => {
                get().removeNotification(newNotification.id);
              }, newNotification.duration);
            }
          }),

        removeNotification: id =>
          set(state => {
            state.notifications = state.notifications.filter(n => n.id !== id);
          }),

        clearNotifications: () =>
          set(state => {
            state.notifications = [];
          }),

        // Search and filter actions
        setSearchQuery: query =>
          set(state => {
            state.searchQuery = query;
          }),

        setSelectedCategory: category =>
          set(state => {
            state.selectedCategory = category;
          }),

        setSortBy: sortBy =>
          set(state => {
            state.sortBy = sortBy;
          }),

        setSortOrder: order =>
          set(state => {
            state.sortOrder = order;
          }),

        resetFilters: () =>
          set(state => {
            state.searchQuery = '';
            state.selectedCategory = null;
            state.sortBy = 'name';
            state.sortOrder = 'asc';
          }),
      })),
      {
        name: 'superhuman-nutrition-store',
        partialize: state => ({
          // Only persist non-sensitive data
          selectedFoods: state.selectedFoods,
          sidebarOpen: state.sidebarOpen,
          currentPage: state.currentPage,
          searchQuery: state.searchQuery,
          selectedCategory: state.selectedCategory,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
        }),
      }
    ),
    {
      name: 'superhuman-nutrition-store',
    }
  )
);

// Selector hooks for better performance
export const useUser = () =>
  useAppStore(state => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    authLoading: state.authLoading,
  }));

export const useFoodGroups = () =>
  useAppStore(state => ({
    foodGroups: state.foodGroups,
    loading: state.foodGroupsLoading,
    error: state.foodGroupsError,
  }));

export const useMealPlanning = () =>
  useAppStore(state => ({
    selectedFoods: state.selectedFoods,
    mealPlan: state.mealPlan,
    loading: state.mealPlanLoading,
    error: state.mealPlanError,
  }));

export const useUI = () =>
  useAppStore(state => ({
    sidebarOpen: state.sidebarOpen,
    currentPage: state.currentPage,
    notifications: state.notifications,
  }));

export const useFilters = () =>
  useAppStore(state => ({
    searchQuery: state.searchQuery,
    selectedCategory: state.selectedCategory,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
  }));
