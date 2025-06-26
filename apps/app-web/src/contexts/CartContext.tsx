'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { toast } from 'sonner';
import { cartService } from '@/services';
import { ICart, ICartItem as BaseCartItem, CartContextType } from '@app/shared-types';
import { useAuth } from './AuthContext';

// Extend ICartItem to include id field from backend
interface ICartItem extends BaseCartItem {
  id?: number;
  cartId?: number;
}

// Extend ICart to use our extended ICartItem
interface ICartWithId extends Omit<ICart, 'items'> {
  id?: number;
  items: ICartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Local storage key for guest cart
const GUEST_CART_KEY = 'grabhealth_guest_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<ICartWithId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Get cart items from cart object
  const cartItems = cart?.items || [];

  // Calculate cart count and total
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart?.total || 0;

  // Helper functions for guest cart
  const getGuestCart = (): ICartWithId | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : null;
  };

  const saveGuestCart = (guestCart: ICartWithId) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
    }
  };

  const clearGuestCart = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  };

  // Fetch cart items
  const fetchCart = async () => {
    try {
      setIsLoading(true);
      
      if (user) {
        // User is logged in, fetch from API
        const cartData = await cartService.getCart();
        setCart(cartData);
        
        // Merge any guest cart items if they exist
        const guestCart = getGuestCart();
        if (guestCart && guestCart.items.length > 0) {
          // Sync guest cart items to server
          try {
            for (const item of guestCart.items) {
              await cartService.addToCart(item.productId.toString(), item.quantity);
            }
            // Clear guest cart after successful sync
            clearGuestCart();
            // Refresh cart to get updated server state
            const updatedCart = await cartService.getCart();
            setCart(updatedCart);
          } catch (error) {
            console.error('Failed to sync guest cart:', error);
          }
        }
      } else {
        // User is not logged in, use local storage
        const guestCart = getGuestCart();
        setCart(guestCart || { 
          id: 0,
          userId: '', 
          items: [], 
          total: 0, 
          tax: 0, 
          subtotal: 0,
          discount: 0 
        });
      }
    } catch (error: any) {
      // Don't show error for PENDING_VERIFICATION users or 403 errors
      if (error?.response?.status === 403) {
        // User doesn't have access to cart yet (PENDING_VERIFICATION)
        setCart(null);
      } else if (user) {
        // Only show error for other types of errors
        console.error('Error fetching cart:', error);
        toast.error('Failed to load cart');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh cart when user changes
  useEffect(() => {
    fetchCart();
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
    try {
      if (user) {
        // User is logged in, use API
        const updatedCart = await cartService.addToCart(product.id.toString(), quantity);
        setCart(updatedCart);
      } else {
        // User is not logged in, use local storage
        const currentCart = cart || { id: 0, userId: '', items: [], total: 0, tax: 0, subtotal: 0, discount: 0 };
        
        // Create a new cart object to ensure React detects the change
        const updatedCart: ICartWithId = { ...currentCart, items: [...currentCart.items] };
        
        // Check if item already exists
        const existingItemIndex = updatedCart.items.findIndex(item => item.productId === product.id);
        
        if (existingItemIndex >= 0) {
          // Update quantity - create new item object
          updatedCart.items[existingItemIndex] = {
            ...updatedCart.items[existingItemIndex],
            quantity: updatedCart.items[existingItemIndex].quantity + quantity
          };
        } else {
          // Add new item
          const newItem: ICartItem = {
            productId: product.id,
            quantity,
            price: product.price,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.image_url || '',
              description: '',
              inStock: true,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          };
          updatedCart.items.push(newItem);
        }
        
        // Recalculate totals
        updatedCart.subtotal = updatedCart.items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
        updatedCart.tax = updatedCart.subtotal * 0.07; // 7% GST
        updatedCart.total = updatedCart.subtotal + updatedCart.tax;
        
        setCart(updatedCart);
        saveGuestCart(updatedCart);
      }
      
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeItem(productId);
        return;
      }

      if (user) {
        // User is logged in, use API
        const updatedCart = await cartService.updateCartItem(
          productId.toString(),
          quantity
        );
        setCart(updatedCart);
      } else {
        // User is not logged in, use local storage
        const currentCart = cart || { id: 0, userId: '', items: [], total: 0, tax: 0, subtotal: 0, discount: 0 };
        
        // Create a new cart object to ensure React detects the change
        const updatedCart: ICartWithId = { ...currentCart, items: [...currentCart.items] };
        const itemIndex = updatedCart.items.findIndex(item => item.productId === productId);
        
        if (itemIndex >= 0) {
          // Create new item object with updated quantity
          updatedCart.items[itemIndex] = {
            ...updatedCart.items[itemIndex],
            quantity: quantity
          };
          
          // Recalculate totals
          updatedCart.subtotal = updatedCart.items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
          updatedCart.tax = updatedCart.subtotal * 0.07; // 7% GST
          updatedCart.total = updatedCart.subtotal + updatedCart.tax;
          
          setCart(updatedCart);
          saveGuestCart(updatedCart);
        }
      }
      
      toast.success('Cart updated');
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    }
  };

  // Remove item from cart
  const removeItem = async (productId: number) => {
    try {
      if (user) {
        // User is logged in, use API
        const updatedCart = await cartService.removeFromCart(productId.toString());
        setCart(updatedCart);
      } else {
        // User is not logged in, use local storage
        const currentCart = cart || { id: 0, userId: '', items: [], total: 0, tax: 0, subtotal: 0, discount: 0 };
        
        // Create a new cart object with filtered items
        const updatedCart: ICartWithId = {
          ...currentCart,
          items: currentCart.items.filter(item => item.productId !== productId)
        };
        
        // Recalculate totals
        updatedCart.subtotal = updatedCart.items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
        updatedCart.tax = updatedCart.subtotal * 0.07; // 7% GST
        updatedCart.total = updatedCart.subtotal + updatedCart.tax;
        
        setCart(updatedCart);
        saveGuestCart(updatedCart);
      }
      
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      if (user) {
        // User is logged in, use API
        await cartService.clearCart();
        setCart(null);
      } else {
        // User is not logged in, clear local storage
        clearGuestCart();
        setCart({ id: 0, userId: '', items: [], total: 0, tax: 0, subtotal: 0, discount: 0 });
      }
      
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  // Refresh cart
  const refreshCart = async () => {
    await fetchCart();
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
