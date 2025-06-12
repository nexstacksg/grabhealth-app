import { apiClient } from "./api-client";
import { ICart, ICartItem } from "@app/shared-types";

class CartService {
  private baseUrl = "/cart";

  /**
   * Get current cart
   */
  async getCart(): Promise<ICart> {
    const response = await apiClient.get<ICart>(
      this.baseUrl
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Failed to get cart");
    }

    return response.data;
  }

  /**
   * Add item to cart
   */
  async addToCart(productId: number, quantity: number): Promise<ICart> {
    const response = await apiClient.post<ICart>(
      `${this.baseUrl}/add`,
      { productId, quantity }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Failed to add to cart");
    }

    return response.data;
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(productId: number, quantity: number): Promise<ICart> {
    const response = await apiClient.put<ICart>(
      `${this.baseUrl}/update`,
      { productId, quantity }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Failed to update cart");
    }

    return response.data;
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(productId: number): Promise<ICart> {
    const response = await apiClient.delete<ICart>(
      `${this.baseUrl}/item/${productId}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Failed to remove from cart");
    }

    return response.data;
  }

  /**
   * Clear cart
   */
  async clearCart(): Promise<void> {
    const response = await apiClient.delete<void>(
      `${this.baseUrl}/clear`
    );

    if (!response.success) {
      throw new Error(response.error?.message || "Failed to clear cart");
    }
  }

  /**
   * Sync guest cart with user cart
   */
  async syncCart(guestCart: ICartItem[]): Promise<ICart> {
    const response = await apiClient.post<ICart>(
      `${this.baseUrl}/sync`,
      { items: guestCart }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Failed to sync cart");
    }

    return response.data;
  }
}

export const cartService = new CartService();
export default cartService;