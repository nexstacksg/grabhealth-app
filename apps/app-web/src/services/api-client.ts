import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
// Check if we're on the server
const isServer = typeof window === 'undefined';

// Strapi API client configuration

// Create axios instance
const createApiClient = (): AxiosInstance => {
  // Use Strapi API URL
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

// Create the API client
const axiosInstance = createApiClient();

// Request interceptor for auth headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Add Bearer token for authenticated requests
    if (!isServer && typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
axiosInstance.interceptors.response.use(
  (response) => {
    // Return the full response data (let services handle transformation)
    return response.data;
  },
  async (error: AxiosError<any>) => {
    // Handle 401 errors by redirecting to login
    if (
      error.response?.status === 401 &&
      !isServer &&
      typeof window !== 'undefined'
    ) {
      // Clear stored tokens and user data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');

      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/auth/')) {
        window.location.href = '/auth/login';
      }
    }

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

      console.error('API Response Error:', errorDetails);

      // Handle Strapi error format
      const strapiError = error.response.data?.error;
      const customError = {
        message:
          strapiError?.message ||
          error.response.data?.message ||
          'An error occurred',
        status: error.response.status,
        code: strapiError?.status || error.response.status,
        details: strapiError?.details,
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

class ApiClient {
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return await axiosInstance.get(endpoint, config);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return await axiosInstance.post(endpoint, data, config);
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return await axiosInstance.put(endpoint, data, config);
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return await axiosInstance.delete(endpoint, config);
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return await axiosInstance.patch(endpoint, data, config);
  }
}

export const apiClient = new ApiClient();
export default ApiClient;

// Export axios for type imports
export { AxiosError } from 'axios';
