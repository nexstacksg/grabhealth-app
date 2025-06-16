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
      data = await response.json();
    } catch (error) {
      // If response is not JSON (e.g., HTML error page), throw a proper error
      throw new ServiceError(
        'Invalid response format from server',
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
    const queryString = this.buildQueryString(params);
    const response = await fetch(`${this.apiUrl}${endpoint}${queryString}`, {
      method: 'GET',
      headers: await this.buildHeaders(),
      credentials: 'include'
    });

    return this.handleResponse<T>(response);
  }

  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: await this.buildHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include'
    });

    return this.handleResponse<T>(response);
  }

  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      method: 'PUT',
      headers: await this.buildHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include'
    });

    return this.handleResponse<T>(response);
  }

  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      method: 'PATCH',
      headers: await this.buildHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include'
    });

    return this.handleResponse<T>(response);
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      method: 'DELETE',
      headers: await this.buildHeaders(),
      credentials: 'include'
    });

    return this.handleResponse<T>(response);
  }
}