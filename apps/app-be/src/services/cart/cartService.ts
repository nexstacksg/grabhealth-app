import { ICart, ICartItem, ProductStatus } from '@app/shared-types';
import { AppError } from '../../middleware/error/errorHandler';
import prisma from '../../database/client';

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
    
    // Populate product details for each cart item
    const cart = CartService.carts[userId];
    const itemsWithProducts = await Promise.all(
      cart.items.map(async (item: any) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { 
            category: true,
            productPricing: true
          }
        });
        
        const productPrice = product?.productPricing?.customerPrice || 0;
        
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: productPrice,
          product: product ? {
            id: product.id,
            name: product.name,
            description: product.description,
            price: productPrice,
            image_url: product.imageUrl,
            imageUrl: product.imageUrl,
            product_name: product.name,
            categoryId: product.categoryId,
            category: product.category,
            inStock: product.inStock,
            status: product.status as ProductStatus,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
          } : null
        };
      })
    );
    
    return {
      ...cart,
      items: itemsWithProducts as ICartItem[]
    };
  }

  async addToCart(
    userId: string,
    productId: number,
    quantity: number
  ): Promise<ICart> {
    // Fetch product details first
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { 
        category: true,
        productPricing: true
      }
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (!product.inStock) {
      throw new AppError('Product is out of stock', 400);
    }

    const productPrice = product.productPricing?.customerPrice || 0;

    const cart = await this.getCart(userId);

    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity for existing item
      CartService.carts[userId].items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item with price
      CartService.carts[userId].items.push({ 
        productId, 
        quantity,
        price: productPrice
      });
    }

    return this.updateCartTotalsAndFetchProducts(userId);
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
      throw new AppError('Item not found in cart', 404);
    }

    if (quantity <= 0) {
      CartService.carts[userId].items.splice(itemIndex, 1);
    } else {
      CartService.carts[userId].items[itemIndex].quantity = quantity;
    }

    return this.updateCartTotalsAndFetchProducts(userId);
  }

  async removeFromCart(userId: string, productId: number): Promise<ICart> {
    await this.getCart(userId);

    CartService.carts[userId].items = CartService.carts[userId].items.filter(
      (item: any) => item.productId !== productId
    );

    return this.updateCartTotalsAndFetchProducts(userId);
  }

  async clearCart(userId: string): Promise<void> {
    delete CartService.carts[userId];
  }

  async syncCart(userId: string, items: any[]): Promise<ICart> {
    await this.getCart(userId);

    // Merge items from client with existing cart
    for (const newItem of items) {
      const existingIndex = CartService.carts[userId].items.findIndex(
        (item: any) => item.productId === newItem.productId
      );

      if (existingIndex >= 0) {
        // Update quantity if item exists
        CartService.carts[userId].items[existingIndex].quantity += newItem.quantity;
      } else {
        // Fetch product price if not provided
        let price = newItem.price;
        if (!price) {
          const product = await prisma.product.findUnique({
            where: { id: newItem.productId },
            include: { productPricing: true }
          });
          price = product?.productPricing?.customerPrice || 0;
        }
        
        // Add new item
        CartService.carts[userId].items.push({
          productId: newItem.productId,
          quantity: newItem.quantity,
          price: price,
        });
      }
    }

    return this.updateCartTotalsAndFetchProducts(userId);
  }

  private async updateCartTotalsAndFetchProducts(userId: string): Promise<ICart> {
    const cart = await this.getCart(userId);
    
    cart.subtotal = cart.items.reduce(
      (sum: number, item: any) => sum + item.quantity * (item.price || 0),
      0
    );
    cart.discount = 0; // Discounts from promotions only, no membership discounts
    cart.total = cart.subtotal - cart.discount;

    CartService.carts[userId] = {
      ...CartService.carts[userId],
      total: cart.total,
      subtotal: cart.subtotal,
      discount: cart.discount
    };

    return cart;
  }

}
