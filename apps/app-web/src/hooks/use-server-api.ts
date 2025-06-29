'use client';

import { useState, useCallback } from 'react';
import { apiAction } from '@/app/actions';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface UseServerApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for making authenticated API calls from client components
 * Uses server actions to handle httpOnly cookies
 */
export function useServerApi<T = any>(options?: UseServerApiOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (
    method: HttpMethod,
    endpoint: string,
    body?: any
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiAction<T>(method, endpoint, body);
      
      if (result.success) {
        setData(result.data);
        options?.onSuccess?.(result.data);
        return result.data;
      } else {
        setError(result.error || 'Request failed');
        options?.onError?.(result.error || 'Request failed');
        throw new Error(result.error);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const get = useCallback((endpoint: string) => 
    execute('GET', endpoint), [execute]);

  const post = useCallback((endpoint: string, body?: any) => 
    execute('POST', endpoint, body), [execute]);

  const put = useCallback((endpoint: string, body?: any) => 
    execute('PUT', endpoint, body), [execute]);

  const del = useCallback((endpoint: string) => 
    execute('DELETE', endpoint), [execute]);

  const patch = useCallback((endpoint: string, body?: any) => 
    execute('PATCH', endpoint, body), [execute]);

  return {
    loading,
    error,
    data,
    get,
    post,
    put,
    delete: del,
    patch,
  };
}