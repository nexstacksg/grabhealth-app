'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { toast } from 'sonner';

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  cartCount: number;
  cartTotal: number;
  addToCart: (
    product: {
      id: number;
      name: string;
      price: number;
      image_url?: string;
    },
    quantity?: number
  ) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: () => Promise<number | null>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate cart count and total
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Fetch cart items on component mount (only in browser)
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const fetchCartItems = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('/api/cart');

          if (!response.ok) {
            if (response.status !== 401) {
              // Ignore unauthorized errors
              toast.error('Failed to load cart');
            }
            return;
          }

          const data = await response.json();
          setCartItems(data.cartItems || []);
        } catch (error) {
          console.error('Error fetching cart:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCartItems();
    }
  }, []);

  // Add item to cart
  const addToCart = async (
    product: {
      id: number;
      name: string;
      price: number;
      image_url?: string;
    },
    quantity: number = 1
  ) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          quantity,
          price: product.price,
          imageUrl: product.image_url,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to add item to cart');
        return;
      }

      // Refresh cart items
      const cartResponse = await fetch('/api/cart');
      const data = await cartResponse.json();
      setCartItems(data.cartItems || []);

      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Update item quantity
  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItemId,
          quantity,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to update cart');
        return;
      }

      // If quantity is 0, item will be removed, so refresh cart
      const cartResponse = await fetch('/api/cart');
      const data = await cartResponse.json();
      setCartItems(data.cartItems || []);

      toast.success('Cart updated');
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    }
  };

  // Remove item from cart
  const removeItem = async (cartItemId: number) => {
    try {
      const response = await fetch(`/api/cart?itemId=${cartItemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove item');
        return;
      }

      // Update local state by removing the item
      setCartItems(cartItems.filter((item) => item.id !== cartItemId));

      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart?clearAll=true', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to clear cart');
        return;
      }

      // Clear local cart state
      setCartItems([]);

      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  // Checkout - convert cart to order
  const checkout = async (): Promise<number | null> => {
    try {
      const response = await fetch('/api/cart/checkout', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to checkout');
        return null;
      }

      const data = await response.json();

      // Clear local cart state after successful checkout
      setCartItems([]);

      toast.success('Order placed successfully!');

      return data.orderId;
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('Failed to complete checkout');
      return null;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};
