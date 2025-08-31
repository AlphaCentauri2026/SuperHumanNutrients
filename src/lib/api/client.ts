// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: unknown;
  fallback?: boolean;
}

// Request options interface
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// API client configuration
interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers: Record<string, string>;
}

// Default configuration
const defaultConfig: ApiClientConfig = {
  baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Centralized API client with error handling and retry logic
 */
export class ApiClient {
  private config: ApiClientConfig;
  private authToken: string | null = null;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
    if (token) {
      this.config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete this.config.headers.Authorization;
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.config.timeout,
      retries = this.config.retries,
      retryDelay = this.config.retryDelay,
    } = options;

    const url = `${this.config.baseUrl}${endpoint}`;
    const requestHeaders = { ...this.config.headers, ...headers };

    // Add auth token if available
    if (this.authToken && !requestHeaders.Authorization) {
      requestHeaders.Authorization = `Bearer ${this.authToken}`;
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle HTTP errors
        if (!response.ok) {
          const errorData = await this.parseErrorResponse(response);
          throw new Error(
            errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`
          );
        }

        // Parse successful response
        const data = await response.json();
        return data as ApiResponse<T>;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (this.shouldNotRetry(error as Error)) {
          break;
        }

        // If this is the last attempt, throw the error
        if (attempt === retries) {
          break;
        }

        // Wait before retrying
        await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
      }
    }

    // All retries failed
    return {
      success: false,
      error: lastError?.message || 'Request failed after all retries',
      details: lastError,
    };
  }

  /**
   * Parse error response from API
   */
  private async parseErrorResponse(
    response: Response
  ): Promise<{ message: string; details?: unknown }> {
    try {
      const errorData = await response.json();
      return {
        message:
          errorData.error || errorData.message || `HTTP ${response.status}`,
        details: errorData.details,
      };
    } catch {
      return {
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  }

  /**
   * Determine if request should not be retried
   */
  private shouldNotRetry(error: Error): boolean {
    // Don't retry on client errors (4xx) or certain network errors
    if (error.name === 'AbortError') return true;
    if (error.message.includes('HTTP 4')) return true;
    return false;
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Convenience methods for common HTTP methods
   */
  async get<T>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: data });
  }

  async delete<T>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data,
    });
  }
}

// Create default API client instance
export const apiClient = new ApiClient();

// Export convenience functions
export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
    apiClient.get<T>(endpoint, options),

  post: <T>(
    endpoint: string,
    data?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => apiClient.post<T>(endpoint, data, options),

  put: <T>(
    endpoint: string,
    data?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => apiClient.put<T>(endpoint, data, options),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
    apiClient.delete<T>(endpoint, options),

  patch: <T>(
    endpoint: string,
    data?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => apiClient.patch<T>(endpoint, data, options),

  setAuthToken: (token: string | null) => apiClient.setAuthToken(token),
};
