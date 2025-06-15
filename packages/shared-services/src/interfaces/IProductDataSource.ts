import {
  IProduct,
  ProductSearchParams,
  ProductSearchResponse
} from '@app/shared-types';

export interface IProductDataSource {
  searchProducts(params?: ProductSearchParams): Promise<ProductSearchResponse>;
  getProduct(id: number): Promise<IProduct>;
  getFeaturedProducts(): Promise<IProduct[]>;
  getProductsByCategory(categoryId: number): Promise<IProduct[]>;
  getCategories(): Promise<any[]>;
}