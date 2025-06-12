import { OrderStatus, PaymentStatus, PaymentMethod } from '../enums/order';

export interface IOrder {
  id: number;
  userId: string; // Changed to string to match backend User model
  total: number;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  discount?: number;
  createdAt: Date;
}

export interface IOrderCreate {
  userId: string; // Changed to string to match backend User model
  items: IOrderItemCreate[];
  paymentMethod?: PaymentMethod;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
}

export interface IOrderItemCreate {
  productId: number;
  quantity: number;
  price: number;
  discount?: number;
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
  product?: any;
}

export interface ICart {
  userId: string; // Changed to string to match backend User model
  items: ICartItem[];
  total: number;
  subtotal: number;
  discount: number;
  tax?: number;
}