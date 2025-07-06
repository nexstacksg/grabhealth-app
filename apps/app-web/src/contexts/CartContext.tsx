'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { toast } from 'sonner';
import {
  ICart,
  ICartItem as BaseCartItem,
  CartContextType,
} from '@app/shared-types';
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

// Local storage keys
const GUEST_CART_KEY = 'grabhealth_guest_cart';
const AUTH_CART_KEY = 'grabhealth_auth_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<ICartWithId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cartAnimating, setCartAnimating] = useState(false);
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

  // Helper functions for authenticated user cart
  const getAuthenticatedCart = (): ICartWithId | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(AUTH_CART_KEY);
    return stored ? JSON.parse(stored) : null;
  };

  const saveAuthenticatedCart = (authCart: ICartWithId) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_CART_KEY, JSON.stringify(authCart));
    }
  };

  const clearAuthenticatedCart = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_CART_KEY);
    }
  };

  // Fetch cart items from local storage
  const fetchCart = async () => {
    try {
      setIsLoading(true);

      if (user) {
        // User is logged in, get from authenticated cart storage
        const authCart = getAuthenticatedCart();

        // If no authenticated cart exists, check for guest cart to migrate
        if (!authCart) {
          const guestCart = getGuestCart();
          if (guestCart && guestCart.items.length > 0) {
            // Migrate guest cart to authenticated cart
            const migratedCart: ICartWithId = {
              ...guestCart,
              userId: user?.documentId || '',
            };
            setCart(migratedCart);
            saveAuthenticatedCart(migratedCart);
            clearGuestCart();
          } else {
            // Create empty authenticated cart
            const emptyCart: ICartWithId = {
              id: 0,
              userId: user?.documentId || '',
              items: [],
              total: 0,
              tax: 0,
              subtotal: 0,
              discount: 0,
            };
            setCart(emptyCart);
            saveAuthenticatedCart(emptyCart);
          }
        } else {
          setCart(authCart);
        }
      } else {
        // User is not logged in, use guest cart
        const guestCart = getGuestCart();
        setCart(
          guestCart || {
            id: 0,
            userId: '',
            items: [],
            total: 0,
            tax: 0,
            subtotal: 0,
            discount: 0,
          }
        );
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
      // Use local storage for both authenticated and guest users (no API calls needed)
      {
        // Use local storage for both authenticated and guest users
        const currentCart = cart || {
          id: 0,
          userId: user?.documentId || '',
          items: [],
          total: 0,
          tax: 0,
          subtotal: 0,
          discount: 0,
        };

        // Create a new cart object to ensure React detects the change
        const updatedCart: ICartWithId = {
          ...currentCart,
          items: [...currentCart.items],
        };

        // Check if item already exists
        const existingItemIndex = updatedCart.items.findIndex(
          (item) => item.productId === product.id
        );

        if (existingItemIndex >= 0) {
          // Update quantity - create new item object
          updatedCart.items[existingItemIndex] = {
            ...updatedCart.items[existingItemIndex],
            quantity: updatedCart.items[existingItemIndex].quantity + quantity,
          };
        } else {
          // Add new item
          const newItem: ICartItem = {
            productId: product.id,
            quantity,
            price: product.price,
            product: {
              documentId: (product.id || '')?.toString(),
              name: product.name,
              price: product.price,
              imageUrl: product?.image_url || '',
              description: '',
              inStock: true,
              status: 'active',
            },
          };
          updatedCart.items.push(newItem);
        }

        // Recalculate totals
        updatedCart.subtotal = updatedCart.items.reduce(
          (sum, item) => sum + (item.price || 0) * item.quantity,
          0
        );
        updatedCart.tax = updatedCart.subtotal * 0.09; // 9% tax
        updatedCart.total = updatedCart.subtotal + updatedCart.tax;

        setCart(updatedCart);

        // Save to localStorage (use different keys for authenticated vs guest users)
        if (user) {
          saveAuthenticatedCart(updatedCart);
        } else {
          saveGuestCart(updatedCart);
        }
      }

      toast.success(`${product.name} added to cart`);
      
      // Trigger cart animation
      setCartAnimating(true);
      setTimeout(() => setCartAnimating(false), 1200); // Animation duration
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    const currentCart = cart || {
      id: 0,
      userId: user?.documentId || '',
      items: [],
      total: 0,
      tax: 0,
      subtotal: 0,
      discount: 0,
    };

    const updatedCart: ICartWithId = {
      ...currentCart,
      items: [...currentCart.items],
    };

    const itemIndex = updatedCart.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex >= 0) {
      updatedCart.items[itemIndex] = {
        ...updatedCart.items[itemIndex],
        quantity: quantity,
      };

      // Recalculate totals
      updatedCart.subtotal = updatedCart.items.reduce(
        (sum, item) => sum + (item.price || 0) * item.quantity,
        0
      );
      updatedCart.tax = updatedCart.subtotal * 0.09; // 9% tax
      updatedCart.total = updatedCart.subtotal + updatedCart.tax;

      setCart(updatedCart);

      // Save to localStorage
      if (user) {
        saveAuthenticatedCart(updatedCart);
      } else {
        saveGuestCart(updatedCart);
      }

      toast.success('Cart updated');
    }
  };

  // Remove item from cart
  const removeItem = async (productId: number) => {
    // Use local storage for both authenticated and guest users
    const currentCart = cart || {
      id: 0,
      userId: user?.documentId || '',
      items: [],
      total: 0,
      tax: 0,
      subtotal: 0,
      discount: 0,
    };

    // Create a new cart object with filtered items
    const updatedCart: ICartWithId = {
      ...currentCart,
      items: currentCart.items.filter((item) => item.productId !== productId),
    };

    // Recalculate totals
    updatedCart.subtotal = updatedCart.items.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    );
    updatedCart.tax = updatedCart.subtotal * 0.09; // 9% tax
    updatedCart.total = updatedCart.subtotal + updatedCart.tax;

    setCart(updatedCart);

    // Save to localStorage
    if (user) {
      saveAuthenticatedCart(updatedCart);
    } else {
      saveGuestCart(updatedCart);
    }

    toast.success('Item removed from cart');
  };

  // Clear cart
  const clearCart = async () => {
    const emptyCart: ICartWithId = {
      id: 0,
      userId: user?.documentId || '',
      items: [],
      total: 0,
      tax: 0,
      subtotal: 0,
      discount: 0,
    };

    setCart(emptyCart);

    // Clear from localStorage and save the empty cart
    if (user) {
      // Clear the old cart
      clearAuthenticatedCart();
      // Save the empty cart to ensure it's properly initialized
      saveAuthenticatedCart(emptyCart);
    } else {
      // Clear the old cart
      clearGuestCart();
      // Save the empty cart to ensure it's properly initialized
      saveGuestCart(emptyCart);
    }

    toast.success('Cart cleared');
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
        cartAnimating,
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
