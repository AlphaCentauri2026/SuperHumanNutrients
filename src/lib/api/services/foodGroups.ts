import { api, ApiResponse } from '../client';
import { FoodGroup } from '@/lib/database';
import { FoodGroupSchema } from '@/lib/validation/schemas';
import { sanitizeObject } from '@/lib/validation/sanitization';

// Food group service interface
export interface FoodGroupService {
  getAll(): Promise<ApiResponse<FoodGroup[]>>;
  getByCategory(category: string): Promise<ApiResponse<FoodGroup[]>>;
  search(query: string): Promise<ApiResponse<FoodGroup[]>>;
  getById(id: string): Promise<ApiResponse<FoodGroup>>;
  create(
    foodGroup: Omit<FoodGroup, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<{ id: string }>>;
  update(
    id: string,
    updates: Partial<FoodGroup>
  ): Promise<ApiResponse<{ success: boolean }>>;
  delete(id: string): Promise<ApiResponse<{ success: boolean }>>;
  importFromCSV(
    csvData: string
  ): Promise<ApiResponse<{ imported: number; errors: string[] }>>;
}

// Food group service implementation
export class FoodGroupServiceImpl implements FoodGroupService {
  private baseEndpoint = '/api/food-groups';

  /**
   * Get all food groups
   */
  async getAll(): Promise<ApiResponse<FoodGroup[]>> {
    try {
      const response = await api.get<FoodGroup[]>(this.baseEndpoint);
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch food groups',
        details: error,
      };
    }
  }

  /**
   * Get food groups by category
   */
  async getByCategory(category: string): Promise<ApiResponse<FoodGroup[]>> {
    try {
      const response = await api.get<FoodGroup[]>(
        `${this.baseEndpoint}?category=${encodeURIComponent(category)}`
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch food groups for category: ${category}`,
        details: error,
      };
    }
  }

  /**
   * Search food groups by query
   */
  async search(query: string): Promise<ApiResponse<FoodGroup[]>> {
    try {
      const response = await api.get<FoodGroup[]>(
        `${this.baseEndpoint}?search=${encodeURIComponent(query)}`
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: `Failed to search food groups with query: ${query}`,
        details: error,
      };
    }
  }

  /**
   * Get food group by ID
   */
  async getById(id: string): Promise<ApiResponse<FoodGroup>> {
    try {
      const response = await api.get<FoodGroup>(`${this.baseEndpoint}/${id}`);
      return response;
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch food group with ID: ${id}`,
        details: error,
      };
    }
  }

  /**
   * Create new food group
   */
  async create(
    foodGroup: Omit<FoodGroup, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<{ id: string }>> {
    try {
      // Validate input data
      const validationResult = FoodGroupSchema.safeParse(foodGroup);
      if (!validationResult.success) {
        return {
          success: false,
          error: 'Invalid food group data',
          details: validationResult.error.issues,
        };
      }

      // Sanitize input data
      const sanitizedData = sanitizeObject(validationResult.data);

      const response = await api.post<{ id: string }>(
        this.baseEndpoint,
        sanitizedData
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create food group',
        details: error,
      };
    }
  }

  /**
   * Update existing food group
   */
  async update(
    id: string,
    updates: Partial<FoodGroup>
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      // Validate update data
      const validationResult = FoodGroupSchema.partial().safeParse(updates);
      if (!validationResult.success) {
        return {
          success: false,
          error: 'Invalid update data',
          details: validationResult.error.issues,
        };
      }

      // Sanitize update data
      const sanitizedData = sanitizeObject(validationResult.data);

      const response = await api.put<{ success: boolean }>(
        `${this.baseEndpoint}/${id}`,
        sanitizedData
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: `Failed to update food group with ID: ${id}`,
        details: error,
      };
    }
  }

  /**
   * Delete food group
   */
  async delete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await api.delete<{ success: boolean }>(
        `${this.baseEndpoint}/${id}`
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete food group with ID: ${id}`,
        details: error,
      };
    }
  }

  /**
   * Import food groups from CSV
   */
  async importFromCSV(
    csvData: string
  ): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    try {
      const response = await api.post<{ imported: number; errors: string[] }>(
        `${this.baseEndpoint}/import`,
        { csvData }
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to import food groups from CSV',
        details: error,
      };
    }
  }

  /**
   * Get filtered and sorted food groups
   */
  async getFiltered(
    options: {
      category?: string;
      search?: string;
      sortBy?: 'name' | 'category' | 'calories';
      sortOrder?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<ApiResponse<FoodGroup[]>> {
    try {
      const params = new URLSearchParams();

      if (options.category) params.append('category', options.category);
      if (options.search) params.append('search', options.search);
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());

      const queryString = params.toString();
      const endpoint = queryString
        ? `${this.baseEndpoint}?${queryString}`
        : this.baseEndpoint;

      const response = await api.get<FoodGroup[]>(endpoint);
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch filtered food groups',
        details: error,
      };
    }
  }
}

// Create and export service instance
export const foodGroupService = new FoodGroupServiceImpl();

// Export convenience functions
export const foodGroupsApi = {
  getAll: () => foodGroupService.getAll(),
  getByCategory: (category: string) => foodGroupService.getByCategory(category),
  search: (query: string) => foodGroupService.search(query),
  getById: (id: string) => foodGroupService.getById(id),
  create: (foodGroup: Omit<FoodGroup, 'id' | 'createdAt' | 'updatedAt'>) =>
    foodGroupService.create(foodGroup),
  update: (id: string, updates: Partial<FoodGroup>) =>
    foodGroupService.update(id, updates),
  delete: (id: string) => foodGroupService.delete(id),
  importFromCSV: (csvData: string) => foodGroupService.importFromCSV(csvData),
  getFiltered: (options?: Parameters<typeof foodGroupService.getFiltered>[0]) =>
    foodGroupService.getFiltered(options),
};
