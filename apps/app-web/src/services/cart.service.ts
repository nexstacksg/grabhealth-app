/**
 * Cart Service - Handles all cart related API calls
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import { ICart, ApiResponse } from '@app/shared-types';

class CartService extends BaseService {
  async getCart(): Promise<ICart> {
    try {
      const response = await apiClient.get<ApiResponse<ICart>>('/cart');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async addToCart(productId: string, quantity: number): Promise<ICart> {
    try {
      const response = await apiClient.post<ApiResponse<ICart>>('/cart/add', { productId, quantity });
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateCartItem(itemId: string, quantity: number): Promise<ICart> {
    try {
      const response = await apiClient.put<ApiResponse<ICart>>(`/cart/items/${itemId}`, { quantity });
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async removeFromCart(itemId: string): Promise<ICart> {
    try {
      const response = await apiClient.delete<ApiResponse<ICart>>(`/cart/items/${itemId}`);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async clearCart(): Promise<void> {
    try {
      await apiClient.delete('/cart');
    } catch (error) {
      this.handleError(error);
    }
  }

  async syncCart(guestCartId: string): Promise<ICart> {
    try {
      const response = await apiClient.post<ApiResponse<ICart>>('/cart/sync', { guestCartId });
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const cartService = new CartService('/cart');