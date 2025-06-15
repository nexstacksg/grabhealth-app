import {
  IOrder,
  IOrderCreate,
  IOrderStats,
  PaginatedResponse,
} from '@app/shared-types';

export interface IOrderDataSource {
  createOrder(data: IOrderCreate): Promise<IOrder>;
  getMyOrders(page: number, limit: number): Promise<PaginatedResponse<IOrder>>;
  getOrder(id: number): Promise<IOrder>;
  cancelOrder(id: number): Promise<IOrder>;
  getOrderStats(): Promise<IOrderStats>;
  checkoutFromCart(
    paymentMethod: string,
    shippingAddress: string,
    billingAddress: string
  ): Promise<IOrder>;
}