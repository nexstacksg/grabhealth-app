import { ApiResponse } from '@app/shared-types';

export abstract class BaseService {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Standard error handler for all services
   */
  protected handleError(error: any): never {
    // If it's already a structured error from our API
    if (error?.error?.message) {
      throw error;
    }

    // If it's an axios error with response data
    if (error?.response?.data?.error?.message) {
      throw {
        status: error.response.status,
        error: {
          message: error.response.data.error.message,
          code: error.response.data.error.code,
        },
      };
    }

    // Generic error
    throw {
      status: 500,
      error: {
        message: error?.message || 'An unexpected error occurred',
      },
    };
  }

  /**
   * Extract data from API response or throw error
   */
  protected extractData<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw {
        status: response.error?.code || 500,
        error: {
          message: response.error?.message || 'Invalid response from server',
        },
      };
    }
    // Some endpoints return success with message only (no data)
    // Return empty object as T if no data is present
    return response.data || ({} as T);
  }

  /**
   * Build query string from params object
   */
  protected buildQueryString(params?: Record<string, any>): string {
    if (!params) return '';
    
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }
}