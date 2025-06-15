import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { ApiResponse } from '@app/shared-types';

// Check if we're on the server
const isServer = typeof window === 'undefined';

// Queue for requests during token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Create axios instance with different configs for server/client
const createApiClient = (): AxiosInstance => {
  if (isServer) {
    // Server-side: Call backend directly
    return axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  } else {
    // Client-side: Call Next.js API routes
    return axios.create({
      baseURL: '/api',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }
};

// Create the API client
const axiosInstance = createApiClient();

// Helper function to get auth headers for server-side requests
export const getServerAuthHeaders = async (): Promise<Record<string, string>> => {
  if (!isServer) return {};
  
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');
    
    return accessToken ? { Authorization: `Bearer ${accessToken.value}` } : {};
  } catch {
    return {};
  }
};

// Request interceptor for logging and auth headers
axiosInstance.interceptors.request.use(
  (config) => {
    // For debugging
    console.debug('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with automatic token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    console.debug('API Response:', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
    });
    
    // Return the data directly (unwrap the response)
    return response.data;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config;
    
    // If we get a 401 and we're on the client side, try to refresh token
    if (error.response?.status === 401 && originalRequest && !isServer) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;

      try {
        // Attempt to refresh token
        await axiosInstance.post('/auth/refresh');
        
        processQueue(null);
        isRefreshing = false;
        
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        
        // Refresh failed, redirect to login if we're on client side
        if (!isServer && typeof window !== 'undefined') {
          // Clear any stored user data
          sessionStorage.removeItem('user');
          // Redirect to login
          window.location.href = '/auth/login';
        }
        
        return Promise.reject(refreshError);
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
      
      const customError = {
        message: error.response.data?.error?.message || error.response.data?.message || 'An error occurred',
        status: error.response.status,
        code: error.response.data?.error?.code,
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

  async post<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return await axiosInstance.post(endpoint, data, config);
  }

  async put<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return await axiosInstance.put(endpoint, data, config);
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return await axiosInstance.delete(endpoint, config);
  }

  async patch<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return await axiosInstance.patch(endpoint, data, config);
  }
}

export const apiClient = new ApiClient();
export default ApiClient;

// Export axios for type imports
export { AxiosError } from 'axios';