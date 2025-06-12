import { OrderStatus, PaymentStatus, PaymentMethod } from '../enums/order';

export interface IOrder {
  id: number;
  userId: number;
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
  userId: number;
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
  userId: number;
  items: ICartItem[];
  total: number;
  subtotal: number;
  discount: number;
  tax?: number;
}