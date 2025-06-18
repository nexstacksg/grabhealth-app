import {
  IProduct,
  ProductSearchParams,
  ProductSearchResponse,
} from '@app/shared-types';
import { IProductDataSource } from '../interfaces/IProductDataSource';

export interface ProductServiceOptions {
  dataSource: IProductDataSource;
}

// Price range types extracted from useProducts hook
export type PriceRange = 'under25' | '25to50' | '50to100' | 'over100';

export interface EnhancedProductSearchParams extends ProductSearchParams {
  priceRange?: PriceRange;
}

export class ProductService {
  private dataSource: IProductDataSource;

  constructor(options: ProductServiceOptions) {
    this.dataSource = options.dataSource;
  }

  async searchProducts(
    params?: ProductSearchParams
  ): Promise<ProductSearchResponse> {
    return await this.dataSource.searchProducts(params);
  }

  async getProduct(id: number): Promise<IProduct> {
    return await this.dataSource.getProduct(id);
  }

  async getFeaturedProducts(): Promise<IProduct[]> {
    return await this.dataSource.getFeaturedProducts();
  }

  async getProductsByCategory(categoryId: number): Promise<IProduct[]> {
    return await this.dataSource.getProductsByCategory(categoryId);
  }

  async getCategories(): Promise<any[]> {
    return await this.dataSource.getCategories();
  }

  /**
   * Helper function to convert price range string to min/max values
   * Extracted from useProducts hook business logic
   */
  private getPriceRangeValues(
    range: PriceRange
  ): [number | null, number | null] {
    switch (range) {
      case 'under25':
        return [0, 25];
      case '25to50':
        return [25, 50];
      case '50to100':
        return [50, 100];
      case 'over100':
        return [100, null];
      default:
        return [null, null];
    }
  }

  /**
   * Enhanced search with price range support and business logic
   * Extracted from useProducts hook
   */
  async searchProductsWithFilters(
    params: EnhancedProductSearchParams
  ): Promise<ProductSearchResponse> {
    try {
      // Build filters for API call
      const searchParams: ProductSearchParams = {
        page: params.page || 1,
        limit: params.limit || 8,
      };

      // Add category filter
      if (params.category && params.category !== 'all') {
        searchParams.category = params.category;
      }

      // Add price range filter
      if (params.priceRange) {
        const [min, max] = this.getPriceRangeValues(params.priceRange);
        if (min !== null) searchParams.minPrice = min;
        if (max !== null) searchParams.maxPrice = max;
      }

      // Add other filters
      if (params.query) searchParams.query = params.query;
      if (params.inStock !== undefined) searchParams.inStock = params.inStock;
      if (params.minPrice !== undefined)
        searchParams.minPrice = params.minPrice;
      if (params.maxPrice !== undefined)
        searchParams.maxPrice = params.maxPrice;

      const response = await this.dataSource.searchProducts(searchParams);
      return response;
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return empty response on error
      return {
        products: [],
        page: params.page || 1,
        total: 0,
        totalPages: 0,
      };
    }
  }

  /**
   * Convert min/max price values back to price range string
   * Business logic for UI state management
   */
  getPriceRangeFromValues(
    minPrice?: number,
    maxPrice?: number
  ): PriceRange | undefined {
    if (minPrice === 0 && maxPrice === 25) return 'under25';
    if (minPrice === 25 && maxPrice === 50) return '25to50';
    if (minPrice === 50 && maxPrice === 100) return '50to100';
    if (minPrice === 100 && maxPrice === undefined) return 'over100';
    return undefined;
  }
}
