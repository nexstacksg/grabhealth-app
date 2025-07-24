import { ProductStatus } from '../enums/product';

export interface ICategory {
  documentId: string; // Strapi 5 document ID
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null; // Reference to parent category documentId
  isActive: boolean;
  sortOrder: number;
  parent?: ICategory | null;
  children?: ICategory[];
  products?: IProduct[];
}

export interface ICategoryCreate {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string; // Reference to parent category documentId
  isActive?: boolean;
  sortOrder?: number;
}

export interface ICategoryUpdate extends Partial<ICategoryCreate> {
  documentId: string; // Strapi 5 document ID
}

export interface IProductVariant {
  documentId: string; // Strapi 5 document ID
  name: string;
  sku: string;
  price: number;
  unitQuantity: number; // e.g., 1 for single, 20 for box
  unitLabel: string; // e.g., "bottle", "box"
  savingsAmount?: number | null; // Amount saved vs individual units
  isMostPopular?: boolean;
  stock: number;
  productId?: string; // Reference to product documentId
  product?: IProduct;
}

export interface IProduct {
  documentId: string; // Strapi 5 document ID
  name: string;
  description?: string | null;
  price: number;
  categoryId?: string | null; // Reference to category documentId
  category?: ICategory | null;
  imageUrl?: string | null; // Primary image for backward compatibility
  images?: string[]; // Array of all product images
  inStock: boolean;
  status?: ProductStatus | string;
  // Additional Strapi fields
  sku?: string;
  qty?: number;
  slug?: string;
  productStatus?: string;
  variants?: IProductVariant[]; // Product variants
}

export interface IProductCreate {
  name: string;
  description?: string;
  price: number;
  categoryId?: string; // Reference to category documentId
  imageUrl?: string;
  inStock?: boolean;
  status?: ProductStatus;
}

export interface IProductUpdate extends Partial<IProductCreate> {
  documentId: string; // Strapi 5 document ID
}

export interface IProductVariantCreate {
  name: string;
  sku: string;
  price: number;
  unitQuantity?: number;
  unitLabel?: string;
  savingsAmount?: number;
  isMostPopular?: boolean;
  stock?: number;
  productId: string; // Reference to product documentId
}

export interface IProductVariantUpdate extends Partial<IProductVariantCreate> {
  documentId: string; // Strapi 5 document ID
}

export interface IProductCommissionTier {
  documentId: string; // Strapi 5 document ID
  productId: string; // Reference to product documentId
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
