import {
  IProduct,
  ProductSearchParams,
  ProductSearchResponse
} from '@app/shared-types';
import { IProductDataSource } from '../../interfaces/IProductDataSource';
import { BaseApiDataSource } from './BaseApiDataSource';

export class ApiProductDataSource extends BaseApiDataSource implements IProductDataSource {

  async searchProducts(params?: ProductSearchParams): Promise<ProductSearchResponse> {
    return this.get<ProductSearchResponse>('/products/search', params);
  }

  async getProduct(id: number): Promise<IProduct> {
    return this.get<IProduct>(`/products/${id}`);
  }

  async getFeaturedProducts(): Promise<IProduct[]> {
    return this.get<IProduct[]>('/products/featured');
  }

  async getProductsByCategory(categoryId: number): Promise<IProduct[]> {
    return this.get<IProduct[]>(`/products/category/${categoryId}`);
  }

  async getCategories(): Promise<any[]> {
    return this.get<any[]>('/products/categories');
  }
}