import {
  IOrder,
  IOrderCreate,
  IOrderStats,
  PaginatedResponse,
} from '@app/shared-types';
import { IOrderDataSource } from '../../interfaces/IOrderDataSource';
import { BaseApiDataSource } from './BaseApiDataSource';

export class ApiOrderDataSource extends BaseApiDataSource implements IOrderDataSource {

  async createOrder(data: IOrderCreate): Promise<IOrder> {
    return this.post<IOrder>('/orders', data);
  }

  async getMyOrders(page: number, limit: number): Promise<PaginatedResponse<IOrder>> {
    return this.get<PaginatedResponse<IOrder>>(`/orders/my-orders`, { page, limit });
  }

  async getOrder(id: number): Promise<IOrder> {
    return this.get<IOrder>(`/orders/${id}`);
  }

  async cancelOrder(id: number): Promise<IOrder> {
    return this.post<IOrder>(`/orders/${id}/cancel`);
  }

  async getOrderStats(): Promise<IOrderStats> {
    return this.get<IOrderStats>('/orders/stats');
  }

  async checkoutFromCart(
    paymentMethod: string,
    shippingAddress: string,
    billingAddress: string
  ): Promise<IOrder> {
    return this.post<IOrder>('/orders/checkout', {
      paymentMethod,
      shippingAddress,
      billingAddress,
    });
  }
}