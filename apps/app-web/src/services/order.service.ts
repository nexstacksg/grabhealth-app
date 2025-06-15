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
    return await apiClient.post<IOrder>(this.baseUrl, data);
  }

  /**
   * Get user's orders
   */
  async getMyOrders(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<IOrder>> {
    return await apiClient.get<PaginatedResponse<IOrder>>(
      `${this.baseUrl}/my-orders?page=${page}&limit=${limit}`
    );
  }

  /**
   * Get order by ID
   */
  async getOrder(id: number): Promise<IOrder> {
    return await apiClient.get<IOrder>(`${this.baseUrl}/${id}`);
  }

  /**
   * Cancel an order
   */
  async cancelOrder(id: number): Promise<IOrder> {
    return await apiClient.post<IOrder>(
      `${this.baseUrl}/${id}/cancel`,
      undefined
    );
  }

  /**
   * Get order statistics
   */
  async getOrderStats(): Promise<IOrderStats> {
    return await apiClient.get<IOrderStats>(`${this.baseUrl}/stats`);
  }

  /**
   * Checkout from cart
   */
  async checkoutFromCart(
    paymentMethod: string,
    shippingAddress: string,
    billingAddress: string
  ): Promise<IOrder> {
    return await apiClient.post<IOrder>(`${this.baseUrl}/checkout`, {
      paymentMethod,
      shippingAddress,
      billingAddress,
    });
  }
}

export const orderService = new OrderService();
export default orderService;
