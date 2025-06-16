import { ServiceError } from '../../utils/errors';

export abstract class BaseApiDataSource {
  constructor(
    protected apiUrl: string,
    protected getToken?: () => Promise<string | null>
  ) {}

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

  protected async buildHeaders(skipContentType = false): Promise<HeadersInit> {
    const headers: HeadersInit = {};

    if (!skipContentType) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  protected async handleResponse<T>(response: Response): Promise<T> {
    let data: any;
    
    try {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // If the response is not JSON, try to get the text for debugging
        const text = await response.text();
        console.error('Non-JSON response received:', {
          status: response.status,
          statusText: response.statusText,
          contentType,
          url: response.url,
          text: text.substring(0, 500) // Log first 500 chars for debugging
        });
        throw new ServiceError(
          `Server returned non-JSON response (${response.status} ${response.statusText})`,
          'INVALID_RESPONSE',
          response.status
        );
      }
      
      data = await response.json();
    } catch (error) {
      // If we already threw a ServiceError, rethrow it
      if (error instanceof ServiceError) {
        throw error;
      }
      
      // Otherwise, it's a JSON parsing error
      console.error('Failed to parse JSON response:', error);
      throw new ServiceError(
        'Invalid JSON response from server',
        'INVALID_RESPONSE',
        response.status
      );
    }

    if (!response.ok) {
      throw new ServiceError(
        data?.message || data?.error?.message || 'Request failed',
        data?.code || 'API_ERROR',
        response.status
      );
    }

    return data.data || data;
  }

  // Generic CRUD methods
  protected async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await fetch(`${this.apiUrl}${endpoint}${queryString}`, {
        method: 'GET',
        headers: await this.buildHeaders(),
        credentials: 'include'
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error:', error);
        throw new ServiceError(
          'Unable to connect to server. Please check your internet connection.',
          'NETWORK_ERROR',
          0
        );
      }
      // Re-throw other errors
      throw error;
    }
  }

  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: await this.buildHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include'
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error:', error);
        throw new ServiceError(
          'Unable to connect to server. Please check your internet connection.',
          'NETWORK_ERROR',
          0
        );
      }
      // Re-throw other errors
      throw error;
    }
  }

  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'PUT',
        headers: await this.buildHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include'
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error:', error);
        throw new ServiceError(
          'Unable to connect to server. Please check your internet connection.',
          'NETWORK_ERROR',
          0
        );
      }
      // Re-throw other errors
      throw error;
    }
  }

  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'PATCH',
        headers: await this.buildHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include'
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error:', error);
        throw new ServiceError(
          'Unable to connect to server. Please check your internet connection.',
          'NETWORK_ERROR',
          0
        );
      }
      // Re-throw other errors
      throw error;
    }
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'DELETE',
        headers: await this.buildHeaders(),
        credentials: 'include'
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error:', error);
        throw new ServiceError(
          'Unable to connect to server. Please check your internet connection.',
          'NETWORK_ERROR',
          0
        );
      }
      // Re-throw other errors
      throw error;
    }
  }
}