import { apiClient } from './api-client';
import {
  IProduct,
  ProductSearchParams,
  ProductSearchResponse,
} from '@app/shared-types';
import { BaseService } from './base.service';

class ProductService extends BaseService {
  constructor() {
    super('/products');
  }

  /**
   * Search products with filters
   */
  async searchProducts(
    params?: ProductSearchParams
  ): Promise<ProductSearchResponse> {
    const queryString = this.buildQueryString(params);
    return await apiClient.get<ProductSearchResponse>(
      `${this.baseUrl}/search${queryString}`
    );
  }

  /**
   * Get product by ID
   */
  async getProduct(id: number): Promise<IProduct> {
    return await apiClient.get<IProduct>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(): Promise<IProduct[]> {
    return await apiClient.get<IProduct[]>(
      `${this.baseUrl}/featured`
    );
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: number): Promise<IProduct[]> {
    return await apiClient.get<IProduct[]>(
      `${this.baseUrl}/category/${categoryId}`
    );
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<any[]> {
    return await apiClient.get<any[]>(`${this.baseUrl}/categories`);
  }
}

export const productService = new ProductService();
export default productService;
