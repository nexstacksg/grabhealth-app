'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, Package, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import services from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { IOrder, IOrderItem, OrderStatus } from '@app/shared-types';
import { formatPrice } from '@/lib/utils';

interface IOrderWithItems extends IOrder {
  items?: (IOrderItem & { product?: { name: string } })[];
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<IOrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchOrders() {
      // Don't fetch if auth is still loading
      if (isAuthLoading) return;

      // Redirect if not authenticated
      if (!user) {
        router.push('/auth/login');
        return;
      }

      try {
        setIsLoading(true);
        // Fetch all orders (using a high limit)
        const response = await services.order.getMyOrders({ page: 1, limit: 100 });
        setOrders(response.orders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [user, isAuthLoading, router]);

  // Filter orders based on search term and status
  const filteredOrders = orders && Array.isArray(orders) ? orders.filter((order) => {
    const orderIdString = order.id.toString();
    const matchesSearch = orderIdString.includes(searchTerm);
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const handleViewOrder = (orderId: number) => {
    // Navigate to the order details page
    router.push(`/orders/${orderId}`);
  };

  // Calculate number of items for each order
  const getItemCount = (order: IOrderWithItems) => {
    if (order.items && order.items.length > 0) {
      return order.items.length;
    }
    return 0; // Default if items are not loaded
  };

  const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      case OrderStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case OrderStatus.COMPLETED:
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case OrderStatus.REFUNDED:
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      default:
        return '';
    }
  };

  if (isAuthLoading || (isLoading && orders.length === 0)) {
    return (
      <div className="container max-w-4xl py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6 md:py-16">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">My Orders</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>View and track your recent orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search orders..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={OrderStatus.PROCESSING}>Processing</SelectItem>
                  <SelectItem value={OrderStatus.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
                  <SelectItem value={OrderStatus.REFUNDED}>Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No orders found
              </h3>
              <p className="text-gray-500">
                {orders.length === 0
                  ? "You haven't placed any orders yet."
                  : 'No orders match your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {order.status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </TableCell>
                      <TableCell>{getItemCount(order)}</TableCell>
                      <TableCell className="text-right">
                        {formatPrice(order.total)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/')}>
            Continue Shopping
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
