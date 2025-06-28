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
    // If error has already been processed by api-client interceptor
    if (error?.message && error?.status !== undefined) {
      throw error;
    }
    
    // If it's already a structured error from our API
    if (error?.error?.message) {
      throw error;
    }

    // Handle Strapi error format (from response)
    if (error?.response?.data?.error) {
      const strapiError = error.response.data.error;
      throw {
        message: strapiError.message || 'An error occurred',
        status: strapiError.status || error.response.status || 400,
        code: strapiError.name || 'STRAPI_ERROR',
        details: strapiError.details || {},
      };
    }

    // If it's an axios error with response data
    if (error?.response?.data?.message) {
      throw {
        message: error.response.data.message,
        status: error.response.status,
        code: error.response.data.code || 'API_ERROR',
      };
    }

    // Generic error
    throw {
      message: error?.message || 'An unexpected error occurred',
      status: error?.status || 500,
      code: error?.code || 'UNKNOWN_ERROR',
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