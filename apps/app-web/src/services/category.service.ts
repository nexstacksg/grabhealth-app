import { apiClient } from './api-client';
import { ICategory } from '@app/shared-types';

class CategoryService {
  private baseUrl = '/categories';

  /**
   * Get all categories
   */
  async getCategories(): Promise<ICategory[]> {
    return await apiClient.get<ICategory[]>(this.baseUrl);
  }

  /**
   * Get category by ID
   */
  async getCategory(id: number): Promise<ICategory> {
    return await apiClient.get<ICategory>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new category (admin only)
   */
  async createCategory(data: {
    name: string;
    description?: string;
  }): Promise<ICategory> {
    return await apiClient.post<ICategory>(this.baseUrl, data);
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
    return await apiClient.put<ICategory>(
      `${this.baseUrl}/${id}`,
      data
    );
  }

  /**
   * Delete category (admin only)
   */
  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete<void>(`${this.baseUrl}/${id}`);
  }
}

export const categoryService = new CategoryService();
export default categoryService;