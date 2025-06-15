import { ICategory } from '@app/shared-types';
import { ICategoryDataSource, CreateCategoryData, UpdateCategoryData } from '../interfaces/ICategoryDataSource';
import { ServiceOptions } from '../types';

export interface CategoryServiceOptions extends ServiceOptions {
  dataSource: ICategoryDataSource;
}

export class CategoryService {
  private dataSource: ICategoryDataSource;

  constructor(options: CategoryServiceOptions) {
    this.dataSource = options.dataSource;
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<ICategory[]> {
    return this.dataSource.getCategories();
  }

  /**
   * Get category by ID
   */
  async getCategory(id: number): Promise<ICategory> {
    if (!id || id <= 0) {
      throw new Error('Invalid category ID');
    }
    return this.dataSource.getCategory(id);
  }

  /**
   * Create a new category (admin only)
   */
  async createCategory(data: CreateCategoryData): Promise<ICategory> {
    if (!data.name?.trim()) {
      throw new Error('Category name is required');
    }
    
    const categoryData = {
      name: data.name.trim(),
      description: data.description?.trim() || undefined
    };
    
    return this.dataSource.createCategory(categoryData);
  }

  /**
   * Update category (admin only)
   */
  async updateCategory(id: number, data: UpdateCategoryData): Promise<ICategory> {
    if (!id || id <= 0) {
      throw new Error('Invalid category ID');
    }
    
    if (!data.name && !data.description) {
      throw new Error('At least one field must be provided for update');
    }
    
    const updateData: UpdateCategoryData = {};
    if (data.name !== undefined) {
      if (!data.name.trim()) {
        throw new Error('Category name cannot be empty');
      }
      updateData.name = data.name.trim();
    }
    if (data.description !== undefined) {
      updateData.description = data.description.trim() || undefined;
    }
    
    return this.dataSource.updateCategory(id, updateData);
  }

  /**
   * Delete category (admin only)
   */
  async deleteCategory(id: number): Promise<void> {
    if (!id || id <= 0) {
      throw new Error('Invalid category ID');
    }
    return this.dataSource.deleteCategory(id);
  }
}