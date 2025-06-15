import { ICategory } from '@app/shared-types';
import { BaseApiDataSource } from './BaseApiDataSource';
import { ICategoryDataSource, CreateCategoryData, UpdateCategoryData } from '../../interfaces/ICategoryDataSource';

export class ApiCategoryDataSource extends BaseApiDataSource implements ICategoryDataSource {
  private readonly endpoint = '/categories';

  async getCategories(): Promise<ICategory[]> {
    return this.get<ICategory[]>(this.endpoint);
  }

  async getCategory(id: number): Promise<ICategory> {
    return this.get<ICategory>(`${this.endpoint}/${id}`);
  }

  async createCategory(data: CreateCategoryData): Promise<ICategory> {
    return this.post<ICategory>(this.endpoint, data);
  }

  async updateCategory(id: number, data: UpdateCategoryData): Promise<ICategory> {
    return this.put<ICategory>(`${this.endpoint}/${id}`, data);
  }

  async deleteCategory(id: number): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}