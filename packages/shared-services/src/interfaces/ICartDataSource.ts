import { ICart, ICartItem } from '@app/shared-types';

export interface ICartDataSource {
  getCart(): Promise<ICart>;
  addToCart(productId: number, quantity: number): Promise<ICart>;
  updateCartItem(productId: number, quantity: number): Promise<ICart>;
  removeFromCart(productId: number): Promise<ICart>;
  clearCart(): Promise<void>;
  syncCart(guestCart: ICartItem[]): Promise<ICart>;
}