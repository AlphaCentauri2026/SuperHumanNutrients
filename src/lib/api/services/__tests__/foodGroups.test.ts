import { foodGroupService, foodGroupsApi } from '../foodGroups';
import {
  mockApiResponse,
  createMockFoodGroup,
} from '@/__tests__/utils/test-utils';

// Mock validation utilities
jest.mock('@/lib/validation/schemas', () => ({
  FoodGroupSchema: {
    safeParse: jest.fn(data => ({ success: true, data })),
    partial: jest.fn(() => ({
      safeParse: jest.fn(data => ({ success: true, data })),
    })),
  },
}));

jest.mock('@/lib/validation/sanitization', () => ({
  sanitizeObject: jest.fn(data => data),
}));

// Mock the API client
jest.mock('../../client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { api } from '../../client';

const mockApi = api as jest.Mocked<typeof api>;

describe('FoodGroupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all food groups successfully', async () => {
      const mockFoodGroups = [
        createMockFoodGroup(),
        createMockFoodGroup({ id: 'test-2' }),
      ];
      const mockResponse = mockApiResponse(mockFoodGroups);

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await foodGroupService.getAll();

      expect(mockApi.get).toHaveBeenCalledWith('/api/food-groups');
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('Network error');
      mockApi.get.mockRejectedValue(error);

      const result = await foodGroupService.getAll();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch food groups');
      expect(result.details).toBe(error);
    });
  });

  describe('getByCategory', () => {
    it('should fetch food groups by category successfully', async () => {
      const mockFoodGroups = [createMockFoodGroup({ category: 'fruits' })];
      const mockResponse = mockApiResponse(mockFoodGroups);

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await foodGroupService.getByCategory('fruits');

      expect(mockApi.get).toHaveBeenCalledWith(
        '/api/food-groups?category=fruits'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle category-specific errors', async () => {
      const error = new Error('Category not found');
      mockApi.get.mockRejectedValue(error);

      const result = await foodGroupService.getByCategory('invalid-category');

      expect(result.success).toBe(false);
      expect(result.error).toContain('invalid-category');
      expect(result.details).toBe(error);
    });
  });

  describe('search', () => {
    it('should search food groups successfully', async () => {
      const mockFoodGroups = [createMockFoodGroup({ name: 'Apple' })];
      const mockResponse = mockApiResponse(mockFoodGroups);

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await foodGroupService.search('apple');

      expect(mockApi.get).toHaveBeenCalledWith('/api/food-groups?search=apple');
      expect(result).toEqual(mockResponse);
    });

    it('should handle search errors', async () => {
      const error = new Error('Search failed');
      mockApi.get.mockRejectedValue(error);

      const result = await foodGroupService.search('invalid-query');

      expect(result.success).toBe(false);
      expect(result.error).toContain('invalid-query');
      expect(result.details).toBe(error);
    });
  });

  describe('getById', () => {
    it('should fetch food group by ID successfully', async () => {
      const mockFoodGroup = createMockFoodGroup();
      const mockResponse = mockApiResponse(mockFoodGroup);

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await foodGroupService.getById('test-id');

      expect(mockApi.get).toHaveBeenCalledWith('/api/food-groups/test-id');
      expect(result).toEqual(mockResponse);
    });

    it('should handle ID-specific errors', async () => {
      const error = new Error('Food group not found');
      mockApi.get.mockRejectedValue(error);

      const result = await foodGroupService.getById('invalid-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('invalid-id');
      expect(result.details).toBe(error);
    });
  });

  describe('create', () => {
    it('should create food group successfully', async () => {
      const newFoodGroup = createMockFoodGroup();
      delete (newFoodGroup as Record<string, unknown>).id;
      delete (newFoodGroup as Record<string, unknown>).createdAt;
      delete (newFoodGroup as Record<string, unknown>).updatedAt;

      const mockResponse = mockApiResponse({ id: 'new-id' });
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await foodGroupService.create(newFoodGroup);

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/food-groups',
        newFoodGroup
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle creation errors', async () => {
      const newFoodGroup = createMockFoodGroup();
      delete (newFoodGroup as Record<string, unknown>).id;
      delete (newFoodGroup as Record<string, unknown>).createdAt;
      delete (newFoodGroup as Record<string, unknown>).updatedAt;

      const error = new Error('Creation failed');
      mockApi.post.mockRejectedValue(error);

      const result = await foodGroupService.create(newFoodGroup);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create food group');
      expect(result.details).toBe(error);
    });
  });

  describe('update', () => {
    it('should update food group successfully', async () => {
      const updates = { name: 'Updated Food' };
      const mockResponse = mockApiResponse({ success: true });
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await foodGroupService.update('test-id', updates);

      expect(mockApi.put).toHaveBeenCalledWith(
        '/api/food-groups/test-id',
        updates
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle update errors', async () => {
      const updates = { name: 'Updated Food' };
      const error = new Error('Update failed');
      mockApi.put.mockRejectedValue(error);

      const result = await foodGroupService.update('test-id', updates);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update food group with ID: test-id');
      expect(result.details).toBe(error);
    });
  });

  describe('delete', () => {
    it('should delete food group successfully', async () => {
      const mockResponse = mockApiResponse({ success: true });
      mockApi.delete.mockResolvedValue(mockResponse);

      const result = await foodGroupService.delete('test-id');

      expect(mockApi.delete).toHaveBeenCalledWith('/api/food-groups/test-id');
      expect(result).toEqual(mockResponse);
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Deletion failed');
      mockApi.delete.mockRejectedValue(error);

      const result = await foodGroupService.delete('test-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete food group with ID: test-id');
      expect(result.details).toBe(error);
    });
  });

  describe('importFromCSV', () => {
    it('should import CSV data successfully', async () => {
      const csvData = 'name,category\nApple,fruits';
      const mockResponse = mockApiResponse({ imported: 1, errors: [] });
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await foodGroupService.importFromCSV(csvData);

      expect(mockApi.post).toHaveBeenCalledWith('/api/food-groups/import', {
        csvData,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle CSV import errors', async () => {
      const csvData = 'invalid,csv,data';
      const error = new Error('Import failed');
      mockApi.post.mockRejectedValue(error);

      const result = await foodGroupService.importFromCSV(csvData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to import food groups from CSV');
      expect(result.details).toBe(error);
    });
  });

  describe('getFiltered', () => {
    it('should fetch filtered food groups successfully', async () => {
      const mockFoodGroups = [createMockFoodGroup()];
      const mockResponse = mockApiResponse(mockFoodGroups);
      mockApi.get.mockResolvedValue(mockResponse);

      const options = {
        category: 'fruits',
        search: 'apple',
        sortBy: 'name' as const,
        sortOrder: 'asc' as const,
        limit: 10,
        offset: 0,
      };

      const result = await foodGroupService.getFiltered(options);

      expect(mockApi.get).toHaveBeenCalledWith(
        '/api/food-groups?category=fruits&search=apple&sortBy=name&sortOrder=asc&limit=10'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle filtered query errors', async () => {
      const error = new Error('Filter failed');
      mockApi.get.mockRejectedValue(error);

      const result = await foodGroupService.getFiltered({ category: 'fruits' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch filtered food groups');
      expect(result.details).toBe(error);
    });

    it('should build query string correctly with partial options', async () => {
      const mockFoodGroups = [createMockFoodGroup()];
      const mockResponse = mockApiResponse(mockFoodGroups);
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await foodGroupService.getFiltered({ category: 'fruits' });

      expect(mockApi.get).toHaveBeenCalledWith(
        '/api/food-groups?category=fruits'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty options correctly', async () => {
      const mockFoodGroups = [createMockFoodGroup()];
      const mockResponse = mockApiResponse(mockFoodGroups);
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await foodGroupService.getFiltered();

      expect(mockApi.get).toHaveBeenCalledWith('/api/food-groups');
      expect(result).toEqual(mockResponse);
    });
  });
});

describe('foodGroupsApi convenience functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call service methods correctly', async () => {
    const mockFoodGroups = [createMockFoodGroup()];
    const mockResponse = mockApiResponse(mockFoodGroups);
    mockApi.get.mockResolvedValue(mockResponse);

    const result = await foodGroupsApi.getAll();

    expect(result).toEqual(mockResponse);
    expect(mockApi.get).toHaveBeenCalledWith('/api/food-groups');
  });

  it('should handle service method errors', async () => {
    const error = new Error('Service error');
    mockApi.get.mockRejectedValue(error);

    const result = await foodGroupsApi.getAll();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to fetch food groups');
  });
});
