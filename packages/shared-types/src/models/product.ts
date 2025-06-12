import { ProductStatus } from '../enums/product';

export interface ICategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  parent?: ICategory | null;
  children?: ICategory[];
  products?: IProduct[];
}

export interface ICategoryCreate {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ICategoryUpdate extends Partial<ICategoryCreate> {
  id: number;
}

export interface IProduct {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  categoryId?: number | null;
  category?: ICategory | null;
  imageUrl?: string | null;
  inStock: boolean;
  status?: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductCreate {
  name: string;
  description?: string;
  price: number;
  categoryId?: number;
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