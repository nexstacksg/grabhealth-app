/**
 * Cart Service - Handles all cart related API calls for Strapi backend
 */


import { BaseService } from './base.service';
import { ICart, ICartItem } from '@app/shared-types';

// Strapi response format
interface StrapiResponse<T> {
  data: T;
  meta?: any;
}

// Transform Strapi cart to our ICart format
function transformStrapiCart(strapiCart: any): ICart {
  if (!strapiCart) {
    return {
      userId: '',
      items: [],
      total: 0,
      subtotal: 0,
      discount: 0,
      tax: 0,
    };
  }

  // Strapi uses 'cart_items' as the relation name
  const cartItems = strapiCart.cart_items || strapiCart.items || [];

  return {
    userId: strapiCart.userId || '',
    items: cartItems.map(transformStrapiCartItem),
    total: parseFloat(strapiCart.total || 0),
    subtotal: parseFloat(strapiCart.subtotal || 0),
    discount: parseFloat(strapiCart.discount || 0),
    tax: parseFloat(strapiCart.tax || 0),
  };
}

// Transform Strapi cart item to our ICartItem format
function transformStrapiCartItem(strapiItem: any): ICartItem {
  return {
    productId: strapiItem.product?.id || strapiItem.productId,
    quantity: strapiItem.quantity || 1,
    price: parseFloat(strapiItem.price || 0),
    product: strapiItem.product
      ? {
          id: strapiItem.product.id,
          name: strapiItem.product.name,
          description: strapiItem.product.description,
          price: parseFloat(strapiItem.product.price || 0),
          imageUrl: strapiItem.product.imageUrl,
          inStock: strapiItem.product.inStock ?? true,
          status: strapiItem.product.status || 'ACTIVE',
          createdAt: new Date(strapiItem.product.createdAt),
          updatedAt: new Date(strapiItem.product.updatedAt),
        }
      : null,
  };
}

class CartService extends BaseService {
  async getCart(): Promise<ICart> {
    try {
      // For authenticated users, get their cart using the correct Strapi endpoint
      const strapiData = (await this.api.get('/cart')) as any;

      if (strapiData.data) {
        return transformStrapiCart(strapiData.data);
      }

      // Return empty cart if no cart found
      return {
        userId: '',
        items: [],
        total: 0,
        subtotal: 0,
        discount: 0,
        tax: 0,
      };
    } catch (error) {
      console.error('Error getting cart:', error);
      // Return empty cart on error
      return {
        userId: '',
        items: [],
        total: 0,
        subtotal: 0,
        discount: 0,
        tax: 0,
      };
    }
  }

  async addToCart(productId: number, quantity: number = 1): Promise<ICart> {
    try {
      const strapiData = (await this.api.post('/cart/add', {
        productId: productId.toString(),
        quantity,
      })) as any;
      return transformStrapiCart(strapiData.data);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItem(itemId: string, quantity: number): Promise<ICart> {
    try {
      await this.api.put(`/cart/items/${itemId}`, {
        quantity,
      });

      // After updating item, get the updated cart
      return await this.getCart();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  async removeFromCart(itemId: string): Promise<ICart> {
    try {
      await this.api.delete(`/cart/items/${itemId}`);

      // After removing item, get the updated cart
      return await this.getCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  async clearCart(): Promise<void> {
    try {
      await this.api.delete('/cart/clear');
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  async syncCart(guestCartId: string): Promise<ICart> {
    try {
      const strapiData = (await this.api.post('/cart/sync', {
        guestCartId,
      })) as any;
      return transformStrapiCart(strapiData.data);
    } catch (error) {
      console.error('Error syncing cart:', error);
      throw error;
    }
  }
}

export const cartService = new CartService('/cart');
