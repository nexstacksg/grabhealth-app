/**
 * API State Management Utility
 * Extracted from useApi and useApiQuery hooks
 * Provides reusable API state management patterns
 */

export interface ApiState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export interface ApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Execute an API function with state management
 * Replaces the logic from useApi hook
 */
export async function executeApiCall<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options?: ApiOptions
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const result = await apiFunction();
    options?.onSuccess?.(result);
    return { data: result, error: null };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    options?.onError?.(err);
    return { data: null, error: err };
  }
}

/**
 * Execute an API query with automatic retry and error handling
 * Replaces the logic from useApiQuery hook
 */
export async function executeApiQuery<T>(
  apiFunction: () => Promise<T>,
  options?: ApiOptions & { retries?: number }
): Promise<{ data: T | null; error: Error | null }> {
  const maxRetries = options?.retries || 0;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiFunction();
      options?.onSuccess?.(result);
      return { data: result, error: null };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // If this is the last attempt, don't retry
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  options?.onError?.(lastError!);
  return { data: null, error: lastError! };
}

/**
 * Create a standardized error message based on error type
 * Extracted from hook error handling patterns
 */
export function getErrorMessage(error: any): string {
  if (error.code === 'NETWORK_ERROR') {
    return 'Unable to connect to the server. Please check your internet connection.';
  } else if (error.code === 'INVALID_RESPONSE') {
    return 'Server returned an invalid response. Please try again later.';
  } else if (error.statusCode === 404) {
    return 'The requested resource was not found.';
  } else if (error.statusCode === 401) {
    return 'You are not authorized to access this resource.';
  } else if (error.statusCode === 403) {
    return 'Access to this resource is forbidden.';
  } else if (error.statusCode >= 500) {
    return 'Server error occurred. Please try again later.';
  } else {
    return error.message || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Batch API calls with error handling
 * Useful for loading multiple resources simultaneously
 */
export async function executeBatchApiCalls<T>(
  apiCalls: Array<() => Promise<T>>,
  options?: {
    failFast?: boolean;
    onSuccess?: (results: T[]) => void;
    onError?: (errors: Error[]) => void;
  }
): Promise<{ data: T[]; errors: Error[] }> {
  const results: T[] = [];
  const errors: Error[] = [];

  if (options?.failFast) {
    // Fail fast - stop on first error
    try {
      const allResults = await Promise.all(apiCalls.map(call => call()));
      results.push(...allResults);
      options?.onSuccess?.(results);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      errors.push(err);
      options?.onError?.(errors);
    }
  } else {
    // Continue on errors - collect all results and errors
    const promises = apiCalls.map(async (call) => {
      try {
        const result = await call();
        return { success: true, data: result };
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        return { success: false, error: err };
      }
    });

    const outcomes = await Promise.all(promises);
    
    outcomes.forEach(outcome => {
      if (outcome.success) {
        results.push((outcome as any).data);
      } else {
        errors.push((outcome as any).error);
      }
    });

    if (results.length > 0) {
      options?.onSuccess?.(results);
    }
    if (errors.length > 0) {
      options?.onError?.(errors);
    }
  }

  return { data: results, errors };
}
