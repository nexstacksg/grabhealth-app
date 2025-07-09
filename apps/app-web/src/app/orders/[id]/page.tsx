'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Loader2,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { getOrderAction } from '@/app/actions';
import { useAuth } from '@/contexts/AuthContext';
import { IOrder, IOrderItem, OrderStatus } from '@app/shared-types';
import { formatPrice } from '@/lib/utils';

interface IOrderWithItems extends IOrder {
  items?: (IOrderItem & { product?: { name: string } })[];
}

interface OrderDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderDetailsPage({ params }: OrderDetailsProps) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [order, setOrder] = useState<IOrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params using React.use()
  const unwrappedParams = use(params);

  useEffect(() => {
    async function fetchOrderDetails() {
      // Don't fetch if auth is still loading
      if (isAuthLoading) return;
      
      // Redirect if not authenticated
      if (!user) {
        router.push('/auth/login');
        return;
      }

      try {
        setIsLoading(true);
        const orderId = unwrappedParams.id;

        if (!orderId) {
          throw new Error('Invalid order ID');
        }

        const result = await getOrderAction(orderId);
        
        if (result.success && result.order) {
          setOrder(result.order as IOrderWithItems);
        } else {
          throw new Error(result.error || 'Failed to load order');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load order details'
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrderDetails();
  }, [unwrappedParams.id, router, user, isAuthLoading]);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PROCESSING':
        return <Clock className="h-6 w-6 text-blue-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'REFUNDED':
        return <XCircle className="h-6 w-6 text-gray-500" />;
      default:
        return <Package className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return '';
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="container max-w-4xl py-6 md:py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-6 md:py-16">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push('/orders')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>

        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container max-w-4xl py-6 md:py-16">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push('/orders')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Order not found
              </h3>
              <p className="text-gray-500">
                The order you're looking for doesn't exist or you don't have
                permission to view it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-4 md:py-12">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push('/orders')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>

      <div className="flex flex-col md:flex-row items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Order #{order.orderNumber || order.id}</h1>
          <p className="text-gray-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center">
          {getStatusIcon(order.orderStatus)}
          <Badge
            className={`ml-2 text-sm ${getStatusBadgeColor(order.orderStatus)}`}
          >
            {order.orderStatus?.replace('_', ' ') || 'Unknown'}
          </Badge>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>Items included in your order</CardDescription>
        </CardHeader>
        <CardContent>
          {order.items && order.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.product?.name || 'Unknown Product'}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(item.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(item.price * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No items found for this order</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-end">
          <Separator className="my-4 w-full md:w-1/3 ml-auto" />
          <div className="space-y-1 text-right">
            <div className="flex justify-between w-full md:w-1/3">
              <span className="font-medium">Total:</span>
              <span className="font-bold">{formatPrice(order.total)}</span>
            </div>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Timeline</CardTitle>
          <CardDescription>Track the status of your order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Order timeline - this would be dynamic in a real app */}
            <div className="flex">
              <div className="mr-4">
                <div className="bg-emerald-100 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div>
                <p className="font-medium">Order Placed</p>
                <p className="text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>

            {order.orderStatus === 'PROCESSING' || order.orderStatus === 'COMPLETED' ? (
              <div className="flex">
                <div className="mr-4">
                  <div
                    className={`${order.orderStatus === 'COMPLETED' ? 'bg-emerald-100' : 'bg-blue-100'} rounded-full p-2`}
                  >
                    <Clock
                      className={`h-5 w-5 ${order.orderStatus === 'COMPLETED' ? 'text-emerald-600' : 'text-blue-600'}`}
                    />
                  </div>
                </div>
                <div>
                  <p className="font-medium">Processing</p>
                  <p className="text-sm text-gray-500">
                    {order.orderStatus === 'PROCESSING'
                      ? 'Your order is being processed'
                      : 'Completed'}
                  </p>
                </div>
              </div>
            ) : null}

            {order.orderStatus === 'COMPLETED' ? (
              <div className="flex">
                <div className="mr-4">
                  <div className="bg-emerald-100 rounded-full p-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">Completed</p>
                  <p className="text-sm text-gray-500">
                    Your order has been completed
                  </p>
                </div>
              </div>
            ) : null}

            {order.orderStatus === 'REFUNDED' ? (
              <div className="flex">
                <div className="mr-4">
                  <div className="bg-gray-100 rounded-full p-2">
                    <XCircle className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">Refunded</p>
                  <p className="text-sm text-gray-500">
                    Your order has been refunded
                  </p>
                </div>
              </div>
            ) : null}

            {order.orderStatus === 'CANCELLED' ? (
              <div className="flex">
                <div className="mr-4">
                  <div className="bg-red-100 rounded-full p-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">Cancelled</p>
                  <p className="text-sm text-gray-500">
                    Your order has been cancelled
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
