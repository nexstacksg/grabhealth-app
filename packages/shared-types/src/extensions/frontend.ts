/**
 * Frontend-specific type extensions
 * These extend the base Prisma types with additional fields needed by the UI
 */

import { IUser, IUserPublic } from '../models/user';
import { IProduct } from '../models/product';

// Frontend extensions for User (adds computed/UI fields)
export interface IUserWithUI extends IUserPublic {
  // Computed fields for UI
  displayName: string;
  imageUrl?: string; // Maps to profileImage for compatibility
  fullName: string;
  initials: string;
  isOnline?: boolean;
  lastSeenFormatted?: string;
}

// Frontend-specific UserProfile (extends with UI fields)
export interface UserProfileUI extends IUserPublic {
  imageUrl?: string; // UI-friendly alias for profileImage
  phone?: string;
  dateOfBirth?: string; 
  address?: string;
  emergencyContact?: string;
  department?: string;
}

// Frontend extensions for Product  
export interface IProductWithUI extends IProduct {
  // Add UI-only computed fields
  formattedPrice: string;
  isInCart?: boolean;
  cartQuantity?: number;
  relatedProducts?: IProduct[];
}

// Frontend extensions for Cart
export interface ICartItemUI {
  productId: number;
  quantity: number;
  price: number;
  product: IProductWithUI;
  // UI-only fields
  subtotal: number;
  formattedSubtotal: string;
}

// API Response wrappers (omit conflicting fields and re-add them)
export interface IProductResponse extends Omit<IProduct, 'category'> {
  // Additional fields from API joins (override category with simplified version)
  category?: {
    id: number;
    name: string;
  };
  reviews?: {
    average: number;
    count: number;
  };
}

// Search/Filter types (frontend-only)
export interface IProductFilters {
  category?: string;
  priceRange?: [number, number];
  inStock?: boolean;
  sortBy?: 'name' | 'price' | 'created';
  sortOrder?: 'asc' | 'desc';
}