import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from 'axios';

/**
 * Unified API Client
 *
 * A single API client that works seamlessly in all environments:
 * - Server Components (RSC)
 * - Client Components
 * - Server Actions
 * - API Routes
 *
 * Automatically handles authentication based on the environment.
 */

// Environment detection
const isServer = typeof window === 'undefined';

// Get auth token based on environment
async function getAuthToken(): Promise<string | null> {
  if (isServer) {
    // Server-side: use Next.js cookies
    // Dynamic import to avoid issues with client-side bundling
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const accessToken = cookieStore.get('accessToken');
      return accessToken?.value || null;
    } catch (error) {
      // If cookies() throws (e.g., in non-request context), return null
      // This can happen during build time or in non-request contexts
      console.debug('Could not access cookies in server context:', error);
      return null;
    }
  } else {
    // Client-side: use document.cookie
    try {
      const nameEQ = 'accessToken=';
      const cookies = document.cookie.split(';');

      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
          return cookie.substring(nameEQ.length);
        }
      }
      return null;
    } catch (error) {
      // Handle cases where document.cookie might not be available
      console.debug('Could not access cookies in client context:', error);
      return null;
    }
  }
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
const API_TIMEOUT = 30000;

// Create axios instance factory
function createAxiosInstance(): AxiosInstance {
  return axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable sending cookies with cross-origin requests
  });
}

// Custom error class for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: any,
    public response?: AxiosResponse
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Transform Strapi errors to our ApiError format
function transformError(error: AxiosError<any>): ApiError {
  if (error.response) {
    // Server responded with error
    const strapiError = error.response.data?.error;

    // Log detailed error information for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error Details:', {
        url: error.config?.url || 'unknown',
        method: (error.config?.method || 'unknown').toUpperCase(),
        status: error.response.status,
        statusText: error.response.statusText,
        responseData: error.response.data,
        strapiError: strapiError || null,
        fullError: error.message,
      });

      // Also log the raw response for debugging
      console.error('Raw API Response:', error.response.data);
    }

    return new ApiError(
      strapiError?.message ||
        error.response.data?.message ||
        `Error ${error.response.status}: ${error.response.statusText}`,
      strapiError?.status || error.response.status,
      strapiError?.name || error.response.status.toString(),
      strapiError?.details || error.response.data,
      error.response
    );
  } else if (error.request) {
    // Network error
    if (process.env.NODE_ENV === 'development') {
      console.error('Network Error:', error.request);
    }
    return new ApiError(
      'No response from server. Please check your connection.',
      0,
      'NETWORK_ERROR'
    );
  } else {
    // Request setup error
    if (process.env.NODE_ENV === 'development') {
      console.error('Request Setup Error:', error.message);
    }
    return new ApiError(error.message || 'Request failed', 0, 'REQUEST_ERROR');
  }
}

// Main API client class
class UnifiedApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = createAxiosInstance();
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for auth
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          // Debug request details
          console.log('🔍 API Request:', {
            url: `${API_BASE_URL}${config.url}`,
            method: config.method,
            data: config.data,
            headers: config.headers
          });
          
          // Get auth token
          const token = await getAuthToken();

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          // Don't override Content-Type for FormData
          if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
          }

          return config;
        } catch (error) {
          // If token retrieval fails, continue without auth
          console.debug('Failed to get auth token:', error);
          return config;
        }
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Debug successful response
        console.log('✅ API Response Success:', {
          url: response.config.url,
          status: response.status,
          data: response.data
        });
        // Return the data directly (unwrap axios response)
        return response.data;
      },
      (error: AxiosError) => {
        // Debug error response
        console.error('❌ API Response Error:', {
          url: error.config?.url,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        
        // Transform to our error format
        const apiError = transformError(error);
        return Promise.reject(apiError);
      }
    );
  }

  // HTTP methods
  async get<T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.axiosInstance.get(endpoint, config);
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      console.log(`📤 Making POST request to ${endpoint}`, { data });
      const response = await this.axiosInstance.post<T>(endpoint, data, config);
      return response as T;
    } catch (error) {
      console.error(`📥 POST request to ${endpoint} failed:`, error);
      throw error;
    }
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.axiosInstance.put(endpoint, data, config);
  }

  async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.axiosInstance.patch(endpoint, data, config);
  }

  async delete<T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.axiosInstance.delete(endpoint, config);
  }

  // Helper method to build query strings
  buildQueryString(params?: Record<string, any>): string {
    if (!params) return '';

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, String(v)));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // Helper to add auth header manually (for special cases)
  withAuthHeader(
    token: string,
    config?: AxiosRequestConfig
  ): AxiosRequestConfig {
    return {
      ...config,
      headers: {
        ...config?.headers,
        Authorization: `Bearer ${token}`,
      },
    };
  }

  // Helper to check if error is retryable
  private isRetryableError(error: ApiError): boolean {
    // Retry on network errors or 5xx server errors
    return (
      error.code === 'NETWORK_ERROR' ||
      (error.status >= 500 && error.status < 600)
    );
  }

  // Method to make requests with retry logic
  async withRetry<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: ApiError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as ApiError;

        // Don't retry if it's not a retryable error or if it's the last attempt
        if (!this.isRetryableError(lastError) || attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        const waitTime = delay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, waitTime));

        if (process.env.NODE_ENV === 'development') {
          console.log(
            `Retrying request (attempt ${attempt + 1}/${maxRetries + 1}) after ${waitTime}ms`
          );
        }
      }
    }

    throw lastError!;
  }
}

// Export singleton instance
export const apiClient = new UnifiedApiClient();
