'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingCart,
  Trash,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Award,
  BadgePercent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const {
    cartItems,
    cartCount,
    cartTotal,
    isLoading: cartLoading,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const isLoading = cartLoading;

  const handleCheckout = () => {
    router.push('/cart/checkout');
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-14 md:px-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Your Cart</h1>

      {isLoading ? (
        <div className="py-8 flex justify-center items-center">
          <div className="animate-spin h-6 w-6 border-2 border-emerald-500 rounded-full border-t-transparent"></div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="font-medium text-xl mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button
            className="min-w-[200px]"
            onClick={() => router.push('/products')}
          >
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-xl">
                  Cart Items ({cartCount})
                </h2>
                <Button
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => clearCart()}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>

              <Separator className="mb-6" />

              <div className="space-y-6">
                {cartItems.map((item, index) => (
                  <div
                    key={`${item.productId}-${index}`}
                    className="flex gap-4 pb-6 border-b last:border-0 last:pb-0"
                  >
                    <div className="h-24 w-24 rounded-md overflow-hidden relative bg-secondary flex-shrink-0">
                      {item.product?.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-lg">
                          {item.product?.name || 'Unknown Product'}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Unit Price: {formatPrice(item.price || 0)}
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="font-medium">
                          {formatPrice((item.price || 0) * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
              <h2 className="font-semibold text-xl mb-4">Order Summary</h2>

              <Separator className="mb-4" />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>


                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>
                    {formatPrice(cartTotal * 0.07)}
                  </span>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>
                    {formatPrice(cartTotal * 1.07)}
                  </span>
                </div>


                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="mt-4">
                  <Link
                    href="/products"
                    className="text-emerald-600 hover:text-emerald-700 text-sm flex justify-center"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
