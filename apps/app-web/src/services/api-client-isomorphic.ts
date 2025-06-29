import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { cookieUtils } from '@/lib/cookies';

// Check if we're on the server
const isServer = typeof window === 'undefined';

// Helper to get auth token based on environment
async function getAuthToken(): Promise<string | null> {
  if (isServer) {
    // Server-side: use Next.js cookies
    try {
      // Dynamic import for server-only modules
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const accessToken = cookieStore.get('accessToken');
      return accessToken?.value || null;
    } catch (error) {
      // If cookies() throws (e.g., in non-server environment), return null
      console.error('Failed to get server-side cookie:', error);
      return null;
    }
  } else {
    // Client-side: use cookieUtils
    return cookieUtils.get('accessToken');
  }
}

// Create axios instance factory
const createApiClient = (): AxiosInstance => {
  const baseURL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/api`;

  return axios.create({
    baseURL,
    withCredentials: false, // Strapi uses Bearer tokens, not cookies
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });
};

// Create the isomorphic API client class
class IsomorphicApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = createApiClient();
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for auth headers
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Get auth token based on environment
        const token = await getAuthToken();
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Don't override Content-Type if it's FormData (let axios handle multipart/form-data)
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }
        
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for Strapi
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Return the full response data (let services handle transformation)
        return response.data;
      },
      async (error: AxiosError<any>) => {
        // Handle different error types
        const errorDetails: Record<string, unknown> = {
          method: error.config?.method?.toUpperCase(),
          url: error.config?.url,
          message: error.message,
        };

        if (error.response) {
          // The request was made and the server responded with a status code
          errorDetails.status = error.response.status;
          errorDetails.statusText = error.response.statusText;
          errorDetails.data = error.response.data;

          // Handle Strapi error format
          const strapiError = error.response.data?.error;

          const customError = {
            message:
              strapiError?.message ||
              error.response.data?.message ||
              `Error ${error.response.status}: ${error.response.statusText}`,
            status: strapiError?.status || error.response.status,
            code: strapiError?.name || error.response.status,
            details: strapiError?.details || error.response.data,
            response: error.response,
          };
          return Promise.reject(customError);
        } else if (error.request) {
          // Network error
          errorDetails.code = 'NETWORK_ERROR';
          console.error('API Network Error:', errorDetails);

          return Promise.reject({
            message: 'No response from server',
            status: 0,
            code: 'NETWORK_ERROR',
          });
        } else {
          // Request setup error
          errorDetails.code = 'REQUEST_ERROR';
          console.error('API Request Setup Error:', errorDetails);

          return Promise.reject({
            message: error.message || 'Request failed',
            status: 0,
            code: 'REQUEST_ERROR',
          });
        }
      }
    );
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return await this.axiosInstance.get(endpoint, config);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return await this.axiosInstance.post(endpoint, data, config);
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return await this.axiosInstance.put(endpoint, data, config);
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return await this.axiosInstance.delete(endpoint, config);
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return await this.axiosInstance.patch(endpoint, data, config);
  }

  // Helper method to manually set auth headers for specific requests
  // Useful when you already have the token and want to bypass cookie lookup
  withAuthHeader(token: string, config?: AxiosRequestConfig): AxiosRequestConfig {
    return {
      ...config,
      headers: {
        ...config?.headers,
        Authorization: `Bearer ${token}`,
      },
    };
  }
}

// Create and export a singleton instance
export const apiClientIsomorphic = new IsomorphicApiClient();
export default IsomorphicApiClient;

// Export axios error type for convenience
export { AxiosError } from 'axios';