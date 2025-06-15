import { apiClient } from './api-client';
import { ICart, ICartItem } from '@app/shared-types';

class CartService {
  private baseUrl = '/cart';

  /**
   * Get current cart
   */
  async getCart(): Promise<ICart> {
    return await apiClient.get<ICart>(this.baseUrl);
  }

  /**
   * Add item to cart
   */
  async addToCart(productId: number, quantity: number): Promise<ICart> {
    return await apiClient.post<ICart>(`${this.baseUrl}/add`, {
      productId,
      quantity,
    });
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(productId: number, quantity: number): Promise<ICart> {
    return await apiClient.put<ICart>(`${this.baseUrl}/update`, {
      productId,
      quantity,
    });
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(productId: number): Promise<ICart> {
    return await apiClient.delete<ICart>(
      `${this.baseUrl}/item/${productId}`
    );
  }

  /**
   * Clear cart
   */
  async clearCart(): Promise<void> {
    await apiClient.delete<void>(`${this.baseUrl}/clear`);
  }

  /**
   * Sync guest cart with user cart
   */
  async syncCart(guestCart: ICartItem[]): Promise<ICart> {
    return await apiClient.post<ICart>(`${this.baseUrl}/sync`, {
      items: guestCart,
    });
  }
}

export const cartService = new CartService();
export default cartService;
