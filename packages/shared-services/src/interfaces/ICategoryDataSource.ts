import { ICategory } from '@app/shared-types';

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
}

export interface ICategoryDataSource {
  getCategories(): Promise<ICategory[]>;
  getCategory(id: number): Promise<ICategory>;
  createCategory(data: CreateCategoryData): Promise<ICategory>;
  updateCategory(id: number, data: UpdateCategoryData): Promise<ICategory>;
  deleteCategory(id: number): Promise<void>;
}