import { OrderStatus, PaymentStatus, PaymentMethod } from '../enums/order';
import { IProduct } from './product';
import { IUser } from './user';

export interface IOrder {
  id: number | string; // Can be either number or string
  orderNumber: string; // Unique order identifier
  userId: string; // Changed to string to match backend User model
  total: number;
  subtotal: number; // Subtotal before tax/discounts
  discount: number; // Order-level discount
  tax: number; // Tax amount
  status: OrderStatus;
  paymentStatus: PaymentStatus; // Made required to match backend
  paymentMethod?: PaymentMethod | string; // Can be enum or string
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string | null;
  // Relations (when populated)
  user?: IUser;
  items?: IOrderItem[];
  commissions?: any[]; // Future feature
  // Timestamps (added by Strapi)
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // Additional fields from service
  paymentTransactionId?: string | null;
}

export interface IOrderItem {
  id: number | string; // Can be either number or string
  orderId: number | string; // Can be either number or string
  productId: number;
  quantity: number;
  price: number;
  discount?: number;
  pvPoints?: number; // PV points for commission tracking
  // Relations (when populated)
  order?: IOrder;
  product?: IProduct;
  // Timestamps (added by Strapi)
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IOrderCreate {
  userId: string; // Changed to string to match backend User model
  items: IOrderItemCreate[];
  total?: number; // Can be calculated on frontend
  subtotal?: number; // Can be calculated on frontend
  discount?: number; // Order-level discount
  tax?: number; // Tax amount
  status?: OrderStatus; // Optional status
  paymentStatus?: PaymentStatus; // Optional payment status
  paymentMethod?: PaymentMethod | string;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
}

export interface IOrderItemCreate {
  productId: number;
  quantity: number;
  price: number;
  discount?: number;
  pvPoints?: number; // PV points if applicable
}

export interface IOrderUpdate {
  id: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
}

export interface ICartItem {
  productId: number;
  quantity: number;
  price?: number;
  product?: IProduct | null;
}

export interface ICart {
  userId: string; // Changed to string to match backend User model
  items: ICartItem[];
  total: number;
  subtotal: number;
  discount: number;
  tax?: number;
}