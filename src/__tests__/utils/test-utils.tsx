import React, { ReactElement, createContext } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Create a mock AuthContext for testing
const MockAuthContext = createContext({
  user: null,
  loading: false,
  redirectInProgress: false,
  signInWithGoogle: jest.fn(),
  logout: jest.fn(),
  resetAuthState: jest.fn(),
});

// Mock data for testing
export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
};

export const mockFoodGroup = {
  id: 'test-food-id',
  name: 'Test Food',
  category: 'fruits' as const,
  subcategory: 'berries',
  nutrients: ['vitamin c', 'fiber'],
  benefits: ['immune support', 'digestive health'],
  seasonality: 'summer' as const,
  glycemicIndex: 25,
  caloriesPer100g: 52,
  proteinPer100g: 0.7,
  carbsPer100g: 12,
  fatPer100g: 0.3,
  fiberPer100g: 2.4,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authState?: {
    user: typeof mockUser | null;
    isAuthenticated: boolean;
    authLoading: boolean;
  };
}

const AllTheProviders = ({
  children,
  authState,
}: {
  children: React.ReactNode;
  authState?: CustomRenderOptions['authState'];
}) => {
  const defaultAuthState = {
    user: null,
    isAuthenticated: false,
    authLoading: false,
    redirectInProgress: false,
    resetAuthState: false,
    setUser: jest.fn(),
    setAuthLoading: jest.fn(),
    logout: jest.fn(),
  };

  return (
    <MockAuthContext.Provider value={{ ...defaultAuthState, ...authState }}>
      {children}
    </MockAuthContext.Provider>
  );
};

const customRender = (ui: ReactElement, options?: CustomRenderOptions) => {
  const { authState, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders authState={authState}>{children}</AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Test data factories
export const createMockFoodGroup = (
  overrides: Partial<typeof mockFoodGroup> = {}
) => ({
  ...mockFoodGroup,
  ...overrides,
});

export const createMockUser = (overrides: Partial<typeof mockUser> = {}) => ({
  ...mockUser,
  ...overrides,
});

// Mock API responses
export const mockApiResponse = function <T>(data: T, success = true) {
  return {
    success,
    data: success ? data : undefined,
    error: success ? undefined : 'Test error',
    message: success ? 'Success' : 'Error occurred',
  };
};

// Mock fetch responses
export const mockFetchResponse = (data: unknown, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response);
};

// Mock fetch with different responses
export const mockFetch = (responses: Record<string, unknown> = {}) => {
  return jest.fn((url: string) => {
    const response = responses[url] ||
      responses['*'] || { success: true, data: [] };
    return mockFetchResponse(response);
  });
};

// Test environment setup
export const setupTestEnvironment = () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  return {
    localStorageMock,
    sessionStorageMock,
  };
};

// Clean up after tests
export const cleanupTestEnvironment = () => {
  jest.clearAllMocks();
  jest.clearAllTimers();
};
