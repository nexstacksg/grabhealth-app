'use server';

/**
 * Generic server action for any authenticated API call
 * This can be used for any endpoint that requires authentication
 * 
 * @example
 * const result = await apiAction('GET', '/products');
 * const result = await apiAction('POST', '/comments', { text: 'Hello' });
 */
export async function apiAction<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  body?: any
) {
  const { serverApi } = await import('@/lib/server-api');
  return serverApi<T>(endpoint, { method, body });
}