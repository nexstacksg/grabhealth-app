/**
 * Product Service - Handles all product related API calls
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import { IProduct, ICategory, ProductSearchParams } from '@app/shared-types';

export type PriceRange = '0-50' | '50-100' | '100-200' | '200+';

export interface EnhancedProductSearchParams extends ProductSearchParams {
  priceRange?: PriceRange;
}

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
  if (!strapiCategory) return null;

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

// Transform Strapi product to our IProduct format
function transformStrapiProduct(strapiProduct: any): IProduct {
  // Handle image URL - Strapi v5 format
  let imageUrl = '';
  if (
    strapiProduct.imageUrl &&
    Array.isArray(strapiProduct.imageUrl) &&
    strapiProduct.imageUrl.length > 0
  ) {
    // Get the full URL from Strapi
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
    imageUrl = `${baseUrl}${strapiProduct.imageUrl[0].url}`;
  }

  return {
    id: strapiProduct.id,
    name: strapiProduct.name || '',
    description: strapiProduct.description || '',
    price: strapiProduct.price || 0, // Default to 0 if no price
    sku: strapiProduct.sku || '',
    inStock: strapiProduct.inStock ?? true,
    status: strapiProduct.status || 'ACTIVE',
    imageUrl,
    category: transformStrapiCategory(strapiProduct.category),
    createdAt: new Date(strapiProduct.createdAt),
    updatedAt: new Date(strapiProduct.updatedAt),
  };
}

class ProductService extends BaseService {
  async searchProducts(params?: ProductSearchParams): Promise<{
    products: IProduct[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      // Build Strapi query parameters
      const queryParams = new URLSearchParams();

      // Pagination
      if (params?.page) {
        queryParams.append('pagination[page]', params.page.toString());
      }
      if (params?.limit) {
        queryParams.append('pagination[pageSize]', params.limit.toString());
      }

      // Search query
      if (params?.query) {
        queryParams.append('filters[name][$containsi]', params.query);
      }

      // Category filter
      if (params?.category && params.category !== 'all') {
        queryParams.append('filters[category][slug][$eq]', params.category);
      }

      // Always populate category data
      queryParams.append('populate', '*');

      // Include draft/unpublished content
      queryParams.append('publicationState', 'preview');

      const queryString = queryParams.toString();
      const url = `/products${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<StrapiResponse<any[]>>(url);
      const strapiData = response.data as any;

      // Handle Strapi v5 format
      const products = strapiData.data || [];
      const meta = strapiData.meta || {};
      const pagination = meta.pagination || {};

      const transformedProducts = products.map(transformStrapiProduct);

      const result = {
        products: transformedProducts,
        total: pagination.total || 0,
        page: pagination.page || 1,
        totalPages: pagination.pageCount || 0,
      };

      return result;
    } catch (error) {
      this.handleError(error);
    }
  }

  async searchProductsWithFilters(
    params?: EnhancedProductSearchParams
  ): Promise<{
    products: IProduct[];
    total: number;
    page: number;
    totalPages: number;
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
      const response = await apiClient.get<StrapiResponse<any>>(
        `/products/${id}?populate=*`
      );
      const strapiData = response.data as any;

      // Handle Strapi v5 format
      const product = strapiData.data || strapiData;

      return transformStrapiProduct(product);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getFeaturedProducts(limit: number = 4): Promise<IProduct[]> {
    try {
      const response = await apiClient.get<ApiResponse<IProduct[]>>(
        '/products/featured',
        { params: { limit } }
      );
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProductsByCategory(
    categoryId: string,
    params?: ProductSearchParams
  ): Promise<{ products: IProduct[]; total: number }> {
    const searchParams = { ...params, category: categoryId };
    const result = await this.searchProducts(searchParams);
    return { products: result.products, total: result.total };
  }

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

  // Helper method to convert min/max price values to price range
  getPriceRangeFromValues(
    minPrice?: number,
    maxPrice?: number
  ): PriceRange | undefined {
    if (minPrice === undefined && maxPrice === undefined) {
      return undefined;
    }

    if (minPrice === 0 && maxPrice === 50) {
      return '0-50';
    } else if (minPrice === 50 && maxPrice === 100) {
      return '50-100';
    } else if (minPrice === 100 && maxPrice === 200) {
      return '100-200';
    } else if (minPrice === 200 && maxPrice === undefined) {
      return '200+';
    }

    return undefined;
  }
}

export const productService = new ProductService('/products');
