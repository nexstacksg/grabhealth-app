'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { toast } from 'sonner';
import { cartService } from '@/services/cart.service';
import { ICart, ICartItem } from '@app/shared-types';
import { useAuth } from '@/contexts/AuthContext';

interface CartContextType {
  cart: ICart | null;
  cartItems: ICartItem[];
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
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<ICart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Get cart items from cart object
  const cartItems = cart?.items || [];

  // Calculate cart count and total
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart?.total || 0;

  // Fetch cart items
  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Only show error if user is authenticated
      if (user) {
        toast.error('Failed to load cart');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh cart when user changes
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      // Clear cart when logged out
      setCart(null);
      setIsLoading(false);
    }
  }, [user]);

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
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      const updatedCart = await cartService.addToCart(product.id, quantity);
      setCart(updatedCart);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user) {
      toast.error('Please login to update cart');
      return;
    }

    try {
      if (quantity <= 0) {
        await removeItem(productId);
        return;
      }

      const updatedCart = await cartService.updateCartItem(productId, quantity);
      setCart(updatedCart);
      toast.success('Cart updated');
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    }
  };

  // Remove item from cart
  const removeItem = async (productId: number) => {
    if (!user) {
      toast.error('Please login to remove items');
      return;
    }

    try {
      const updatedCart = await cartService.removeFromCart(productId);
      setCart(updatedCart);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!user) {
      toast.error('Please login to clear cart');
      return;
    }

    try {
      await cartService.clearCart();
      setCart(null);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  // Refresh cart
  const refreshCart = async () => {
    if (user) {
      await fetchCart();
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        isLoading,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
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
