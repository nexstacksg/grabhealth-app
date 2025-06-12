import { ICart } from "@app/shared-types";
import { AppError } from "../middleware/error/errorHandler";

interface CartStore {
  [userId: string]: ICart;
}

export class CartService {
  private static carts: CartStore = {};

  async getCart(userId: string): Promise<ICart> {
    if (!CartService.carts[userId]) {
      CartService.carts[userId] = {
        userId,
        items: [],
        total: 0,
        subtotal: 0,
        discount: 0,
      };
    }
    return CartService.carts[userId];
  }

  async addToCart(
    userId: string,
    productId: number,
    quantity: number
  ): Promise<ICart> {
    const cart = await this.getCart(userId);

    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    return this.updateCartTotals(cart);
  }

  async updateCartItem(
    userId: string,
    productId: number,
    quantity: number
  ): Promise<ICart> {
    const cart = await this.getCart(userId);

    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId === productId
    );

    if (itemIndex === -1) {
      throw new AppError("Item not found in cart", 404);
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    return this.updateCartTotals(cart);
  }

  async removeFromCart(userId: string, productId: number): Promise<ICart> {
    const cart = await this.getCart(userId);

    cart.items = cart.items.filter((item) => item.productId !== productId);

    return this.updateCartTotals(cart);
  }

  async clearCart(userId: string): Promise<void> {
    delete CartService.carts[userId];
  }

  async syncCart(userId: string, items: any[]): Promise<ICart> {
    const cart = await this.getCart(userId);

    // Merge items from client with existing cart
    for (const newItem of items) {
      const existingIndex = cart.items.findIndex(
        (item) => item.productId === newItem.productId
      );

      if (existingIndex >= 0) {
        // Update quantity if item exists
        cart.items[existingIndex].quantity += newItem.quantity;
      } else {
        // Add new item
        cart.items.push({
          productId: newItem.productId,
          quantity: newItem.quantity,
          price: newItem.price || 0,
        });
      }
    }

    return this.updateCartTotals(cart);
  }

  private updateCartTotals(cart: ICart): ICart {
    // In a real implementation, this would fetch product prices from database
    // For now, we'll just update the structure
    cart.subtotal = cart.items.reduce(
      (sum: number, item: any) => sum + item.quantity * (item.price || 0),
      0
    );
    cart.discount = 0; // Would calculate based on user membership
    cart.total = cart.subtotal - cart.discount;

    return cart;
  }
}
