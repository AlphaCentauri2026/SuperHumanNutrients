import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthContext } from '../../contexts/AuthContext';

// Mock the useDatabase hook
jest.mock('../../hooks/useDatabase', () => ({
  useDatabase: () => ({
    getFoodGroups: jest.fn(),
    loading: false,
    error: null,
  }),
}));

// Mock the useAuth hook
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthContext: {
    Provider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="auth-provider">{children}</div>
    ),
  },
}));

interface AuthState {
  user: {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
  } | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  redirectInProgress: boolean;
  resetAuthState: boolean;
  setUser: jest.Mock;
  setAuthLoading: jest.Mock;
  logout: jest.Mock;
}

const defaultAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  authLoading: false,
  redirectInProgress: false,
  resetAuthState: false,
  setUser: jest.fn(),
  setAuthLoading: jest.fn(),
  logout: jest.fn(),
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authState?: Partial<AuthState>;
}

export function renderWithAuth(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { authState = {}, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={{ ...defaultAuthState, ...authState }}>
      {children}
    </AuthContext.Provider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
