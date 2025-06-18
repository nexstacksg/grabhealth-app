/**
 * Category Service - Handles all category related API calls
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import { ICategory, ApiResponse } from '@app/shared-types';

class CategoryService extends BaseService {
  async getCategories(): Promise<ICategory[]> {
    try {
      const response = await apiClient.get<ApiResponse<ICategory[]>>('/categories');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCategory(id: string): Promise<ICategory> {
    try {
      const response = await apiClient.get<ApiResponse<ICategory>>(`/categories/${id}`);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const categoryService = new CategoryService('/categories');