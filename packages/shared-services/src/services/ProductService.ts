import {
  IProduct,
  ProductSearchParams,
  ProductSearchResponse
} from '@app/shared-types';
import { IProductDataSource } from '../interfaces/IProductDataSource';

export interface ProductServiceOptions {
  dataSource: IProductDataSource;
}

export class ProductService {
  private dataSource: IProductDataSource;

  constructor(options: ProductServiceOptions) {
    this.dataSource = options.dataSource;
  }

  async searchProducts(params?: ProductSearchParams): Promise<ProductSearchResponse> {
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
}