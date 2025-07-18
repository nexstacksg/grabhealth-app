/**
 * Product Service - Handles all product related API calls
 */

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
function transformStrapiCategory(strapiCategory: any): ICategory | null {
  if (!strapiCategory) return null;

  return {
    documentId:
      strapiCategory.documentId || strapiCategory.id?.toString() || '',
    name: strapiCategory.name || '',
    slug: strapiCategory.slug || '',
    description: strapiCategory.description || null,
    imageUrl: strapiCategory.imageUrl || null,
    parentId: strapiCategory.parentId || null,
    isActive: strapiCategory.isActive ?? true,
    sortOrder: strapiCategory.sortOrder || 0,
  };
}

// Transform Strapi product to our IProduct format
function transformStrapiProduct(strapiProduct: any): IProduct {
  // Handle image URL - Strapi v5 format
  let imageUrl = '';
  let images: string[] = [];
  
  if (
    strapiProduct.imageUrl &&
    Array.isArray(strapiProduct.imageUrl) &&
    strapiProduct.imageUrl.length > 0
  ) {
    // Process all images
    images = strapiProduct.imageUrl.map((imageData: any) => {
      let url = '';
      
      // Check if it's a DigitalOcean Spaces URL (already full URL)
      if (
        imageData.url &&
        (imageData.url.startsWith('http://') ||
          imageData.url.startsWith('https://'))
      ) {
        url = imageData.url;
      }
      // Check if provider is 'aws-s3' (DigitalOcean Spaces uses aws-s3 provider)
      else if (imageData.provider === 'aws-s3' && imageData.url) {
        // URL should already be complete from Strapi
        url = imageData.url;
      }
      // Fallback for local uploads
      else if (imageData.url) {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
        url = `${baseUrl}${imageData.url}`;
      }
      
      return url;
    }).filter((url: string) => url !== '');
    
    // Set primary image (first image) for backward compatibility
    if (images.length > 0) {
      imageUrl = images[0];
    }
  }

  return {
    documentId: strapiProduct.documentId || strapiProduct.id?.toString() || '',
    name: strapiProduct.name || '',
    description: strapiProduct.description || null,
    price: strapiProduct.price || 0,
    categoryId:
      strapiProduct.category?.documentId ||
      strapiProduct.category?.id?.toString() ||
      null,
    category: transformStrapiCategory(strapiProduct.category),
    imageUrl,
    images, // Include all images
    inStock: strapiProduct.inStock ?? true,
    status: strapiProduct.productStatus || 'ACTIVE',
    sku: strapiProduct.sku || undefined,
    qty: strapiProduct.qty || undefined,
    slug: strapiProduct.slug || undefined,
    productStatus: strapiProduct.productStatus || undefined,
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
      // Build query parameters
      const queryParams = new URLSearchParams();
      // Populate both category and imageUrl for product lists
      queryParams.append('populate[category]', 'true');
      queryParams.append('populate[imageUrl]', 'true');

      if (params) {
        if (params.limit) {
          queryParams.append('pagination[pageSize]', params.limit.toString());
        }
        if (params.page) {
          queryParams.append('pagination[page]', params.page.toString());
        }
        if (params.query) {
          // Simple search on name field only for now
          queryParams.append('filters[name][$containsi]', params.query);
        }
        if (params.category) {
          // Use slug for category filtering
          queryParams.append(
            'filters[category][slug][$eq]',
            params.category
          );
        }
        if (params.minPrice !== undefined) {
          queryParams.append(
            'filters[price][$gte]',
            params.minPrice.toString()
          );
        }
        if (params.maxPrice !== undefined) {
          queryParams.append(
            'filters[price][$lte]',
            params.maxPrice.toString()
          );
        }
        if (params.inStock !== undefined) {
          queryParams.append(
            'filters[inStock][$eq]',
            params.inStock.toString()
          );
        }
      }

      // Fetch products with relations using apiClient
      const queryString = queryParams.toString();
      const strapiData = await this.api.get<StrapiResponse<any[]>>(
        `/products?${queryString}`
      );

      // Handle Strapi v5 format
      const products = (strapiData as any).data || [];
      const meta = (strapiData as any).meta || {};
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

  async getProduct(id: number | string): Promise<IProduct> {
    try {
      // For Strapi v5, use documentId if it's a string
      const endpoint = `/products/${id}?populate=*`;

      const response = await this.api.get<StrapiResponse<any>>(endpoint);
      const strapiData = response.data as any;

      // Handle Strapi v5 format
      const product = strapiData.data || strapiData;

      return transformStrapiProduct(product);
    } catch (error) {
      console.error('❌ Error in getProduct:', error);
      throw error; // Re-throw for proper error handling in components
    }
  }

  async getFeaturedProducts(limit: number = 4): Promise<IProduct[]> {
    try {
      // Use the regular products endpoint with a limit for featured products
      const response = await this.searchProducts({ limit });
      return response.products;
    } catch (error) {
      console.error('❌ Error in getFeaturedProducts:', error);
      return [];
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
      const response = await this.api.get<StrapiResponse<any[]>>('/categories');
      const strapiData = response.data as any;

      // Handle Strapi v5 format
      const categories = strapiData.data || strapiData;

      if (Array.isArray(categories)) {
        return categories
          .map(transformStrapiCategory)
          .filter((cat): cat is ICategory => cat !== null);
      }

      return [];
    } catch (error) {
      console.error('❌ Error in getCategories:', error);
      return [];
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
