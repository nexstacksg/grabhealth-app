import { ICart, ICartItem } from '@app/shared-types';
import { ICartDataSource } from '../interfaces/ICartDataSource';

export interface CartServiceOptions {
  dataSource: ICartDataSource;
}

export class CartService {
  private dataSource: ICartDataSource;

  constructor(options: CartServiceOptions) {
    this.dataSource = options.dataSource;
  }

  async getCart(): Promise<ICart> {
    return await this.dataSource.getCart();
  }

  async addToCart(productId: number, quantity: number): Promise<ICart> {
    return await this.dataSource.addToCart(productId, quantity);
  }

  async updateCartItem(productId: number, quantity: number): Promise<ICart> {
    return await this.dataSource.updateCartItem(productId, quantity);
  }

  async removeFromCart(productId: number): Promise<ICart> {
    return await this.dataSource.removeFromCart(productId);
  }

  async clearCart(): Promise<void> {
    return await this.dataSource.clearCart();
  }

  async syncCart(guestCart: ICartItem[]): Promise<ICart> {
    return await this.dataSource.syncCart(guestCart);
  }
}