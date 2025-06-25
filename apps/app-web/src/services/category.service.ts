/**
 * Category Service - Handles all category related API calls
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import { ICategory } from '@app/shared-types';

// Strapi response format
interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Transform Strapi category to our ICategory format
function transformStrapiCategory(strapiCategory: any): ICategory {
  return {
    id: strapiCategory.id,
    name: strapiCategory.name,
    slug: strapiCategory.slug,
    description: strapiCategory.description || '',
    isActive: strapiCategory.isActive ?? true,
    sortOrder: strapiCategory.sortOrder || 0,
    createdAt: new Date(strapiCategory.createdAt),
    updatedAt: new Date(strapiCategory.updatedAt),
  };
}

class CategoryService extends BaseService {
  async getCategories(): Promise<ICategory[]> {
    try {
      const response =
        await apiClient.get<StrapiResponse<any[]>>('/categories');
      const strapiData = response.data as any;

      // Handle Strapi v5 format
      const categories = strapiData.data || strapiData;

      if (Array.isArray(categories)) {
        return categories.map(transformStrapiCategory);
      }

      return [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCategory(id: string): Promise<ICategory> {
    try {
      const response = await apiClient.get<StrapiResponse<any>>(
        `/categories/${id}`
      );
      const strapiData = response.data as any;

      // Handle Strapi v5 format
      const category = strapiData.data || strapiData;

      return transformStrapiCategory(category);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const categoryService = new CategoryService('/categories');
