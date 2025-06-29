import { ApiResponse } from '@app/shared-types';
import { apiClient, ApiError } from '@/lib/api-client';

export abstract class BaseService {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get the API client instance
   * This allows services to use the unified client
   */
  protected get api() {
    return apiClient;
  }

  /**
   * Standard error handler for all services
   * Now simplified since ApiError is already properly formatted
   */
  protected handleError(error: any): never {
    // If it's already an ApiError, just re-throw
    if (error instanceof ApiError) {
      throw error;
    }
    
    // If error has already been processed with our format
    if (error?.message && error?.status !== undefined) {
      throw error;
    }
    
    // Generic error
    throw new ApiError(
      error?.message || 'An unexpected error occurred',
      error?.status || 500,
      error?.code || 'UNKNOWN_ERROR',
      error?.details
    );
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
   * Delegates to the unified API client
   */
  protected buildQueryString(params?: Record<string, any>): string {
    return this.api.buildQueryString(params);
  }
}