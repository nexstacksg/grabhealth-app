import {
  IOrder,
  IOrderCreate,
  IOrderStats,
  PaginatedResponse,
} from '@app/shared-types';
import { IOrderDataSource } from '../interfaces/IOrderDataSource';

export interface OrderServiceOptions {
  dataSource: IOrderDataSource;
}

export class OrderService {
  private dataSource: IOrderDataSource;

  constructor(options: OrderServiceOptions) {
    this.dataSource = options.dataSource;
  }

  async createOrder(data: IOrderCreate): Promise<IOrder> {
    return await this.dataSource.createOrder(data);
  }

  async getMyOrders(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<IOrder>> {
    return await this.dataSource.getMyOrders(page, limit);
  }

  async getOrder(id: number): Promise<IOrder> {
    return await this.dataSource.getOrder(id);
  }

  async cancelOrder(id: number): Promise<IOrder> {
    return await this.dataSource.cancelOrder(id);
  }

  async getOrderStats(): Promise<IOrderStats> {
    return await this.dataSource.getOrderStats();
  }

  async checkoutFromCart(
    paymentMethod: string,
    shippingAddress: string,
    billingAddress: string
  ): Promise<IOrder> {
    return await this.dataSource.checkoutFromCart(
      paymentMethod,
      shippingAddress,
      billingAddress
    );
  }
}