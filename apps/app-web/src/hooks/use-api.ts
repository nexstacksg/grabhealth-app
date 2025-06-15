import { useState, useCallback, useEffect } from 'react';
import { ApiResponse } from '@app/shared-types';

interface UseApiState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for API calls with loading and error states
 */
export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options?: UseApiOptions
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState({ data: null, error: null, isLoading: true });

      try {
        const result = await apiFunction(...args);
        setState({ data: result, error: null, isLoading: false });
        options?.onSuccess?.(result);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        setState({ data: null, error: err, isLoading: false });
        options?.onError?.(err);
        throw err;
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Custom hook for API calls that need to be triggered immediately
 */
export function useApiQuery<T = any>(
  apiFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await apiFunction();
      setState({ data: result, error: null, isLoading: false });
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ data: null, error: err, isLoading: false });
      throw err;
    }
  }, [apiFunction]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    refetch();
  }, dependencies);

  return {
    ...state,
    refetch,
  };
}