import { apiClient } from './api-client';
import { ICategory } from '@app/shared-types';

class CategoryService {
  private baseUrl = '/categories';

  /**
   * Get all categories
   */
  async getCategories(): Promise<ICategory[]> {
    const response = await apiClient.get<ICategory[]>(this.baseUrl);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch categories');
    }

    return response.data;
  }

  /**
   * Get category by ID
   */
  async getCategory(id: number): Promise<ICategory> {
    const response = await apiClient.get<ICategory>(`${this.baseUrl}/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Category not found');
    }

    return response.data;
  }

  /**
   * Create a new category (admin only)
   */
  async createCategory(data: {
    name: string;
    description?: string;
  }): Promise<ICategory> {
    const response = await apiClient.post<ICategory>(this.baseUrl, data);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create category');
    }

    return response.data;
  }

  /**
   * Update category (admin only)
   */
  async updateCategory(
    id: number,
    data: {
      name?: string;
      description?: string;
    }
  ): Promise<ICategory> {
    const response = await apiClient.put<ICategory>(
      `${this.baseUrl}/${id}`,
      data
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update category');
    }

    return response.data;
  }

  /**
   * Delete category (admin only)
   */
  async deleteCategory(id: number): Promise<void> {
    const response = await apiClient.delete<void>(`${this.baseUrl}/${id}`);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete category');
    }
  }
}

export const categoryService = new CategoryService();
export default categoryService;