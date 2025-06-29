'use server';

import { cookies } from 'next/headers';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

/**
 * Reusable server-side API wrapper that handles httpOnly cookies
 * This function can be used for any API call that requires authentication
 */
export async function serverApi<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken');
    
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
    const url = `${baseUrl}/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token.value}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers,
    };

    if (options.body && options.method !== 'GET') {
      fetchOptions.body = JSON.stringify(options.body);
    }

    console.log(`[ServerAPI] ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[ServerAPI] Error:', response.status, errorData);
      
      return { 
        success: false, 
        error: errorData?.error?.message || `Error ${response.status}: ${response.statusText}`,
        details: errorData
      };
    }
    
    const data = await response.json();
    return { success: true, data };
    
  } catch (error: any) {
    console.error('[ServerAPI] Exception:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to make API request',
      details: error
    };
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export async function serverApiGet<T = any>(endpoint: string, headers?: Record<string, string>) {
  return serverApi<T>(endpoint, { method: 'GET', headers });
}

export async function serverApiPost<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
  return serverApi<T>(endpoint, { method: 'POST', body, headers });
}

export async function serverApiPut<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
  return serverApi<T>(endpoint, { method: 'PUT', body, headers });
}

export async function serverApiDelete<T = any>(endpoint: string, headers?: Record<string, string>) {
  return serverApi<T>(endpoint, { method: 'DELETE', headers });
}

export async function serverApiPatch<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
  return serverApi<T>(endpoint, { method: 'PATCH', body, headers });
}