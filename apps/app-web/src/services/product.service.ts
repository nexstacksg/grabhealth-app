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
    const response = await apiClient.get<ProductSearchResponse>(
      `${this.baseUrl}/search${queryString}`
    );

    return this.extractData(response);
  }

  /**
   * Get product by ID
   */
  async getProduct(id: number): Promise<IProduct> {
    const response = await apiClient.get<IProduct>(`${this.baseUrl}/${id}`);

    return this.extractData(response);
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(): Promise<IProduct[]> {
    const response = await apiClient.get<IProduct[]>(
      `${this.baseUrl}/featured`
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to get featured products'
      );
    }

    return response.data;
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: number): Promise<IProduct[]> {
    const response = await apiClient.get<IProduct[]>(
      `${this.baseUrl}/category/${categoryId}`
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to get products by category'
      );
    }

    return response.data;
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<any[]> {
    const response = await apiClient.get<any[]>(`${this.baseUrl}/categories`);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get categories');
    }

    return response.data;
  }
}

export const productService = new ProductService();
export default productService;
