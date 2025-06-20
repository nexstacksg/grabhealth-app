/**
 * Order Service - Handles all order related API calls
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import {
  IOrder,
  IOrderCreate,
  ApiResponse,
} from '@app/shared-types';

interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  completedOrders: number;
}

interface CheckoutRequest {
  cartItems: {
    productId: number;
    quantity: number;
  }[];
  paymentMethod: string;
  shippingAddress: string;
  billingAddress: string;
  notes?: string;
}

class OrderService extends BaseService {
  async createOrder(data: IOrderCreate): Promise<IOrder> {
    try {
      const response = await apiClient.post<ApiResponse<IOrder>>(
        '/orders',
        data
      );
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMyOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    orders: IOrder[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await apiClient.get<
        ApiResponse<{ orders: IOrder[]; pagination: any }>
      >(`/orders/my-orders${queryString}`);
      const data = this.extractData(response);

      return {
        orders: data.orders || [],
        total: data.pagination?.total || 0,
        page: data.pagination?.page || 1,
        totalPages: data.pagination?.totalPages || 0,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getOrder(id: string): Promise<IOrder> {
    try {
      const response = await apiClient.get<ApiResponse<IOrder>>(
        `/orders/${id}`
      );
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async cancelOrder(id: string): Promise<IOrder> {
    try {
      const response = await apiClient.post<ApiResponse<IOrder>>(
        `/orders/${id}/cancel`
      );
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getOrderStats(): Promise<OrderStats> {
    try {
      const response =
        await apiClient.get<ApiResponse<OrderStats>>('/orders/stats');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async checkoutFromCart(data: CheckoutRequest): Promise<IOrder> {
    try {
      const response = await apiClient.post<ApiResponse<IOrder>>(
        '/orders/checkout',
        data
      );
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const orderService = new OrderService('/orders');
