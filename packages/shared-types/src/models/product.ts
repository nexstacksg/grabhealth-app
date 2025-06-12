import { ProductStatus, ProductCategory } from '../enums/product';

export interface IProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  discountEssential: number;
  discountPremium: number;
  category?: string;
  imageUrl?: string;
  inStock: boolean;
  status?: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductCreate {
  name: string;
  description?: string;
  price: number;
  discountEssential?: number;
  discountPremium?: number;
  category?: string;
  imageUrl?: string;
  inStock?: boolean;
  status?: ProductStatus;
}

export interface IProductUpdate extends Partial<IProductCreate> {
  id: number;
}

export interface IProductCommissionTier {
  id: number;
  productId: number;
  productName: string;
  retailPrice: number;
  traderPrice: number;
  distributorPrice: number;
  traderCommissionMin: number;
  traderCommissionMax: number;
  distributorCommissionMin: number;
  distributorCommissionMax: number;
  createdAt: Date;
  updatedAt: Date;
}