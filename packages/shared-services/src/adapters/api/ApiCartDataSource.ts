import { ICart, ICartItem } from '@app/shared-types';
import { ICartDataSource } from '../../interfaces/ICartDataSource';
import { BaseApiDataSource } from './BaseApiDataSource';

export class ApiCartDataSource extends BaseApiDataSource implements ICartDataSource {
  async getCart(): Promise<ICart> {
    return this.get<ICart>('/cart');
  }

  async addToCart(productId: number, quantity: number): Promise<ICart> {
    return this.post<ICart>('/cart/add', { productId, quantity });
  }

  async updateCartItem(productId: number, quantity: number): Promise<ICart> {
    return this.put<ICart>('/cart/update', { productId, quantity });
  }

  async removeFromCart(productId: number): Promise<ICart> {
    return this.delete<ICart>(`/cart/item/${productId}`);
  }

  async clearCart(): Promise<void> {
    return this.delete<void>('/cart/clear');
  }

  async syncCart(guestCart: ICartItem[]): Promise<ICart> {
    return this.post<ICart>('/cart/sync', { items: guestCart });
  }
}