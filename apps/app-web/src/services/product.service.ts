/**
 * Product Service - Handles all product related API calls
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import { 
  IProduct, 
  ICategory,
  ProductSearchParams,
  ApiResponse 
} from '@app/shared-types';

export type PriceRange = '0-50' | '50-100' | '100-200' | '200+';

export interface EnhancedProductSearchParams extends ProductSearchParams {
  priceRange?: PriceRange;
}

class ProductService extends BaseService {
  async searchProducts(params?: ProductSearchParams): Promise<{ 
    products: IProduct[]; 
    total: number; 
    page: number; 
    totalPages: number 
  }> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await apiClient.get<ApiResponse<{ products: IProduct[]; pagination: any }>>(`/products/search${queryString}`);
      
      const data = this.extractData(response);
      return {
        products: data.products || [],
        total: data.pagination?.total || 0,
        page: data.pagination?.page || 1,
        totalPages: data.pagination?.totalPages || 0,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async searchProductsWithFilters(params?: EnhancedProductSearchParams): Promise<{ 
    products: IProduct[]; 
    total: number; 
    page: number; 
    totalPages: number 
  }> {
    // Convert price range to min/max values
    let minPrice = params?.minPrice;
    let maxPrice = params?.maxPrice;
    
    if (params?.priceRange) {
      switch (params.priceRange) {
        case '0-50':
          minPrice = 0;
          maxPrice = 50;
          break;
        case '50-100':
          minPrice = 50;
          maxPrice = 100;
          break;
        case '100-200':
          minPrice = 100;
          maxPrice = 200;
          break;
        case '200+':
          minPrice = 200;
          maxPrice = undefined;
          break;
      }
    }

    const searchParams = {
      ...params,
      minPrice,
      maxPrice,
      priceRange: undefined, // Remove priceRange from params
    };

    return this.searchProducts(searchParams);
  }

  async getProduct(id: number): Promise<IProduct> {
    try {
      const response = await apiClient.get<ApiResponse<IProduct>>(`/products/${id}`);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getFeaturedProducts(limit: number = 4): Promise<IProduct[]> {
    try {
      const response = await apiClient.get<ApiResponse<IProduct[]>>('/products/featured', { params: { limit } });
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProductsByCategory(categoryId: string, params?: ProductSearchParams): Promise<{ products: IProduct[]; total: number }> {
    const searchParams = { ...params, category: categoryId };
    const result = await this.searchProducts(searchParams);
    return { products: result.products, total: result.total };
  }

  async getCategories(): Promise<ICategory[]> {
    try {
      const response = await apiClient.get<ApiResponse<ICategory[]>>('/categories');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const productService = new ProductService('/products');