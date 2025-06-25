/**
 * Product Service - Handles all product related API calls
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import { IProduct, ICategory, ProductSearchParams, ApiResponse } from '@app/shared-types';

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
function transformStrapiCategory(strapiCategory: any): ICategory | null {
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
    const imageData = strapiProduct.imageUrl[0];
    
    // Check if it's a DigitalOcean Spaces URL (already full URL)
    if (imageData.url && (imageData.url.startsWith('http://') || imageData.url.startsWith('https://'))) {
      imageUrl = imageData.url;
    } 
    // Check if provider is 'aws-s3' (DigitalOcean Spaces uses aws-s3 provider)
    else if (imageData.provider === 'aws-s3' && imageData.url) {
      // URL should already be complete from Strapi
      imageUrl = imageData.url;
    }
    // Fallback for local uploads
    else if (imageData.url) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
      imageUrl = `${baseUrl}${imageData.url}`;
    }
  }

  return {
    id: strapiProduct.id,
    name: strapiProduct.name || '',
    description: strapiProduct.description || '',
    price: strapiProduct.price || 0,
    categoryId: strapiProduct.category?.id || null,
    category: transformStrapiCategory(strapiProduct.category),
    imageUrl,
    inStock: strapiProduct.inStock ?? true,
    status: strapiProduct.product_status || strapiProduct.status || 'ACTIVE',
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
      // Fetch products with relations
      const fullUrl =
        'http://localhost:1337/api/products?populate=*';

      const response = await fetch(fullUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const strapiData = await response.json();

      // Handle Strapi v5 format
      const products = strapiData.data || [];
      const meta = strapiData.meta || {};
      const pagination = meta.pagination || {};

      const transformedProducts = products.map(transformStrapiProduct);

      const result = {
        products: transformedProducts,
        total: pagination.total || products.length,
        page: pagination.page || 1,
        totalPages: pagination.pageCount || 1,
      };

      return result;
    } catch (error) {
      console.error('❌ Error in searchProducts:', error);

      // Return empty result instead of throwing
      return {
        products: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
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
        return categories.map(transformStrapiCategory).filter((cat): cat is ICategory => cat !== null);
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
