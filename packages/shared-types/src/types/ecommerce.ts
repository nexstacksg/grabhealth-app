import { IProduct, IOrder, ICart, ICartItem, IPromotion } from '../models';

export interface CheckoutRequest {
  cartItems: Array<{
    productId: number;
    quantity: number;
  }>;
  paymentMethod: string;
  shippingAddress?: string;
  billingAddress?: string;
  promotionCode?: string;
}

export interface CheckoutResponse {
  success: boolean;
  orderId?: number;
  message: string;
  total?: number;
  commission?: {
    amount: number;
    recipients: Array<{
      userId: number;
      amount: number;
      level: number;
    }>;
  };
}

export interface ProductSearchParams {
  query?: string;
  category?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: 'price' | 'name' | 'created' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductSearchResponse {
  products: IProduct[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: IOrder[];
  topProducts: IProduct[];
  commissionStats: {
    totalPaid: number;
    totalPending: number;
    topEarners: Array<{
      userId: number;
      userName: string;
      totalEarned: number;
    }>;
  };
}

export interface NetworkStats {
  totalMembers: number;
  activeMembers: number;
  totalSales: number;
  totalCommissions: number;
  levels: Array<{
    level: number;
    memberCount: number;
    totalSales: number;
  }>;
}

// Cart Context Type for UI state management
export interface CartContextType {
  cart: ICart | null;
  cartItems: ICartItem[];
  isLoading: boolean;
  cartCount: number;
  cartTotal: number;
  cartAnimating: boolean;
  addToCart: (
    product: {
      id: number;
      name: string;
      price: number;
      image_url?: string;
    },
    quantity?: number
  ) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}
