import { apiClient } from './api-client';
import {
  IProduct,
  IProductCreate,
  IProductUpdate,
  ProductSearchParams,
  ProductSearchResponse,
} from '@app/shared-types';

class ProductService {
  private baseUrl = '/products';

  /**
   * Search products with filters
   */
  async searchProducts(
    params?: ProductSearchParams
  ): Promise<ProductSearchResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<ProductSearchResponse>(
      `${this.baseUrl}/search?${queryParams.toString()}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to search products');
    }

    return response.data;
  }

  /**
   * Get product by ID
   */
  async getProduct(id: number): Promise<IProduct> {
    const response = await apiClient.get<IProduct>(`${this.baseUrl}/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Product not found');
    }

    return response.data;
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
