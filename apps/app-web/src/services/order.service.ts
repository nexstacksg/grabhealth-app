import { apiClient } from './api-client';
import {
  IOrder,
  IOrderCreate,
  IOrderStats,
  PaginatedResponse,
} from '@app/shared-types';

class OrderService {
  private baseUrl = '/orders';

  /**
   * Create a new order
   */
  async createOrder(data: IOrderCreate): Promise<IOrder> {
    const response = await apiClient.post<IOrder>(this.baseUrl, data);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create order');
    }

    return response.data;
  }

  /**
   * Get user's orders
   */
  async getMyOrders(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<IOrder>> {
    const response = await apiClient.get<PaginatedResponse<IOrder>>(
      `${this.baseUrl}/my-orders?page=${page}&limit=${limit}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get orders');
    }

    return response.data;
  }

  /**
   * Get order by ID
   */
  async getOrder(id: number): Promise<IOrder> {
    const response = await apiClient.get<IOrder>(`${this.baseUrl}/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Order not found');
    }

    return response.data;
  }

  /**
   * Cancel an order
   */
  async cancelOrder(id: number): Promise<IOrder> {
    const response = await apiClient.post<IOrder>(
      `${this.baseUrl}/${id}/cancel`,
      undefined
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to cancel order');
    }

    return response.data;
  }

  /**
   * Get order statistics
   */
  async getOrderStats(): Promise<IOrderStats> {
    const response = await apiClient.get<IOrderStats>(`${this.baseUrl}/stats`);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get order stats');
    }

    return response.data;
  }

  /**
   * Checkout from cart
   */
  async checkoutFromCart(
    paymentMethod: string,
    shippingAddress: string,
    billingAddress: string
  ): Promise<IOrder> {
    const response = await apiClient.post<IOrder>(`${this.baseUrl}/checkout`, {
      paymentMethod,
      shippingAddress,
      billingAddress,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to checkout');
    }

    return response.data;
  }
}

export const orderService = new OrderService();
export default orderService;
