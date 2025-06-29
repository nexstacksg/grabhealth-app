'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  ShoppingBag,
  Loader2,
  Award,
  BadgePercent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createStripeCheckoutSession } from '@/app/actions';
import { PaymentMethod } from '@app/shared-types';

// Form validation schema
const checkoutFormSchema = z.object({
  // Shipping details
  fullName: z.string().min(2, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(8, { message: 'Phone number is required' }),
  address: z.string().min(10, { message: 'Shipping address is required' }),
  city: z.string().min(2, { message: 'City is required' }),
  postalCode: z.string().min(6, { message: 'Postal code is required' }),
  notes: z.string().optional(),
  
  // Payment method selection
  paymentMethod: z.enum(['stripe', 'cod'], {
    required_error: 'Please select a payment method',
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: 'Singapore',
      postalCode: '',
      notes: '',
      paymentMethod: 'stripe',
    },
  });

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsLoading(true);

    try {
      const shippingAddress = `${values.address}, ${values.city} ${values.postalCode}`;
      
      if (values.paymentMethod === 'stripe') {
        // Create Stripe checkout session
        const items = cart.items.map(item => ({
          name: item.product?.name || `Product ${item.productId}`,
          price: item.product?.price || item.price || 0,
          quantity: item.quantity,
          productId: item.productId,
          image: item.product?.imageUrl || undefined,
        }));

        const result = await createStripeCheckoutSession({ 
          items,
          shippingAddress,
          billingAddress: shippingAddress, // Use same as shipping for now
          notes: values.notes,
        });
        
        if (result.success && result.url) {
          // Clear cart before redirecting to Stripe
          await clearCart();
          
          // Redirect to Stripe checkout
          window.location.href = result.url;
        } else {
          throw new Error(result.error || 'Failed to create checkout session');
        }
      } else {
        // Cash on delivery - create order directly
        toast.info('Cash on delivery is not yet implemented');
        // TODO: Implement COD order creation
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process checkout');
      setIsLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container max-w-2xl py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some products to get started</p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const subtotal = cart.subtotal || 0;
  const discount = cart.discount || 0;
  const tax = cart.tax || 0;
  const total = cart.total || subtotal - discount + tax;

  return (
    <div className="container max-w-6xl py-6 md:py-10">
      <div className="mb-6">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/cart">
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Information
              </CardTitle>
              <CardDescription>
                Enter your delivery details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+65 9123 4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Orchard Road, #01-01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Singapore" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="238801" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special instructions for delivery..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="my-6" />

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </h3>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-3"
                            >
                              <label className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                                <RadioGroupItem value="stripe" />
                                <div className="flex-1">
                                  <div className="font-medium">Pay with Card</div>
                                  <div className="text-sm text-gray-600">
                                    Secure payment via Stripe (Cards, PayNow, GrabPay)
                                  </div>
                                </div>
                              </label>
                              <label className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 opacity-50">
                                <RadioGroupItem value="cod" disabled />
                                <div className="flex-1">
                                  <div className="font-medium">Cash on Delivery</div>
                                  <div className="text-sm text-gray-600">
                                    Pay when you receive your order (Coming soon)
                                  </div>
                                </div>
                              </label>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>{cart.items.length} items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex items-start gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {item.product?.name || `Product ${item.productId}`}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatPrice(item.price || 0)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatPrice((item.price || 0) * item.quantity)}
                  </p>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <BadgePercent className="h-3 w-3" />
                      Discount
                    </span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {user?.membershipTier && (
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span className="font-medium">
                      {user.membershipTier.replace('_', ' ')} Member Discount Applied
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-emerald-100 p-2">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">Secure Payment</p>
                    <p className="text-gray-600">Your payment info is encrypted</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-emerald-100 p-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">Fast Delivery</p>
                    <p className="text-gray-600">Free shipping on orders above $50</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}