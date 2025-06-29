/**
 * Order Service - Handles all order related API calls for Strapi backend
 */


import { BaseService } from './base.service';
import {
  IOrder,
  IOrderCreate,
  ApiResponse,
  IProduct,
  IUserPublic,
} from '@app/shared-types';
import { transformStrapiUser } from './strapi-base';
import { api } from './api.service';

interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  completedOrders: number;
}

interface CheckoutRequest {
  cartItems: {
    productId: number;
    quantity: number;
  }[];
  paymentMethod: string;
  shippingAddress: string;
  billingAddress: string;
  notes?: string;
}

// Strapi response formats
interface StrapiOrderResponse {
  data: any;
  meta?: any;
}

interface StrapiOrdersResponse {
  data: any[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Transform Strapi order to our IOrder format
function transformStrapiOrder(strapiOrder: any): IOrder {
  if (!strapiOrder) {
    throw new Error('Invalid order data');
  }

  // Transform order items
  const items = strapiOrder.items?.map((item: any) => ({
    id: item.id?.toString() || '',
    orderId: strapiOrder.id?.toString() || '',
    productId: item.product?.id || item.productId,
    product: item.product ? transformStrapiProduct(item.product) : undefined,
    quantity: item.quantity || 0,
    price: parseFloat(item.price || 0),
    discount: parseFloat(item.discount || 0),
    pvPoints: item.pvPoints || 0,
  })) || [];

  return {
    id: strapiOrder.id?.toString() || '',
    documentId: strapiOrder.documentId, // Strapi 5 documentId
    orderNumber: strapiOrder.orderNumber || '',
    userId: strapiOrder.user?.id?.toString() || '',
    user: strapiOrder.user ? transformStrapiUser(strapiOrder.user) : undefined,
    total: parseFloat(strapiOrder.total || 0),
    subtotal: parseFloat(strapiOrder.subtotal || 0),
    discount: parseFloat(strapiOrder.discount || 0),
    tax: parseFloat(strapiOrder.tax || 0),
    status: strapiOrder.status || 'PENDING',
    paymentStatus: strapiOrder.paymentStatus || 'PENDING',
    paymentMethod: strapiOrder.paymentMethod || '',
    paymentTransactionId: strapiOrder.paymentTransactionId || null,
    shippingAddress: strapiOrder.shippingAddress || '',
    billingAddress: strapiOrder.billingAddress || '',
    notes: strapiOrder.notes || null,
    items,
    createdAt: new Date(strapiOrder.createdAt),
    updatedAt: new Date(strapiOrder.updatedAt),
  };
}

// Transform Strapi product (minimal transformation for order items)
function transformStrapiProduct(strapiProduct: any): IProduct {
  return {
    id: strapiProduct.id?.toString() || '',
    name: strapiProduct.name || '',
    description: strapiProduct.description || '',
    price: parseFloat(strapiProduct.price || 0),
    categoryId: strapiProduct.category?.id || null,
    category: null, // Not needed for order items
    imageUrl: strapiProduct.imageUrl || '',
    inStock: strapiProduct.inStock ?? true,
    status: strapiProduct.status || 'ACTIVE',
    createdAt: new Date(strapiProduct.createdAt),
    updatedAt: new Date(strapiProduct.updatedAt),
  };
}

class OrderService extends BaseService {
  async createOrder(data: IOrderCreate): Promise<IOrder> {
    try {
      // Generate a unique order number
      const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Transform data to Strapi format
      // For Strapi 5, relations should use connect syntax
      const strapiData = {
        data: {
          orderNumber, // Add the required orderNumber field
          user: {
            connect: [parseInt(data.userId)] // Strapi 5 relation format
          },
          total: data.total,
          subtotal: data.subtotal,
          discount: data.discount || 0,
          tax: data.tax || 0,
          status: data.status || 'PENDING',
          paymentStatus: data.paymentStatus || 'PENDING',
          paymentMethod: data.paymentMethod,
          shippingAddress: data.shippingAddress,
          billingAddress: data.billingAddress,
          notes: data.notes || '',
        }
      };

      const response = await this.api.post<StrapiOrderResponse>(
        '/orders',
        strapiData
      );

      // Handle Strapi 5 response format
      const responseData = response.data || response;
      const order = transformStrapiOrder(responseData.data || responseData);

      // Create order items
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          await this.api.post('/order-items', {
            data: {
              order: {
                connect: [order.id] // Use connect syntax for relations
              },
              product: {
                connect: [item.productId] // Use connect syntax for relations
              },
              quantity: item.quantity,
              price: item.price,
              discount: item.discount || 0,
              pvPoints: item.pvPoints || 0,
            }
          });
        }
      }

      return order;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMyOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    orders: IOrder[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      // First, get the current authenticated user
      const currentUser = await api.auth.getCurrentUser();
      if (!currentUser) {
        return {
          orders: [],
          total: 0,
          page: 1,
          totalPages: 0,
        };
      }

      // Build query params for Strapi
      const queryParams = new URLSearchParams();
      
      // Filter by current user ID
      queryParams.append('filters[user][id][$eq]', currentUser.id.toString());
      
      if (params?.status) {
        queryParams.append('filters[status][$eq]', params.status);
      }
      
      if (params?.page) {
        queryParams.append('pagination[page]', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('pagination[pageSize]', params.limit.toString());
      }
      
      // Populate relations using Strapi 5 syntax with specific fields
      queryParams.append('populate[user][fields]', 'id,username,email');
      queryParams.append('populate[items][populate]', 'product');
      
      // Sort by creation date (newest first)
      queryParams.append('sort', 'createdAt:desc');

      const response = await this.api.get<StrapiOrdersResponse>(
        `/orders?${queryParams.toString()}`
      );

      // Handle Strapi 5 response format
      const responseData = response.data || response;
      const orders = (responseData.data || responseData || []).map(transformStrapiOrder);
      const pagination = responseData.meta?.pagination || response.meta?.pagination || {};

      return {
        orders,
        total: pagination.total || orders.length,
        page: pagination.page || 1,
        totalPages: pagination.pageCount || 1,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        orders: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }
  }

  async getOrder(id: string): Promise<IOrder> {
    try {
      // Build query params for proper population
      const queryParams = new URLSearchParams();
      queryParams.append('populate[user][fields]', 'id,username,email');
      queryParams.append('populate[items][populate]', 'product');
      
      const response = await this.api.get<StrapiOrderResponse>(
        `/orders/${id}?${queryParams.toString()}`
      );
      
      // Handle Strapi 5 response format
      const responseData = response.data || response;
      return transformStrapiOrder(responseData.data || responseData);
    } catch (error) {
      this.handleError(error);
    }
  }

  async cancelOrder(id: string): Promise<IOrder> {
    try {
      // Update order status to CANCELLED
      const response = await this.api.put<StrapiOrderResponse>(
        `/orders/${id}`,
        {
          data: {
            status: 'CANCELLED',
          }
        }
      );
      
      return transformStrapiOrder(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getOrderStats(): Promise<OrderStats> {
    try {
      // This would need a custom controller in Strapi
      // For now, fetch all orders and calculate stats client-side
      const { orders } = await this.getMyOrders({ limit: 100 });
      
      const stats: OrderStats = {
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
        pendingOrders: orders.filter(o => o.status === 'PENDING').length,
        completedOrders: orders.filter(o => o.status === 'COMPLETED').length,
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return {
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        completedOrders: 0,
      };
    }
  }

  async checkoutFromCart(data: CheckoutRequest): Promise<IOrder> {
    try {
      // Calculate totals from cart items
      let subtotal = 0;
      const orderItems = [];
      
      // Note: This would need product price lookup in real implementation
      for (const item of data.cartItems) {
        const product = await this.api.get(`/products/${item.productId}`);
        const price = product.data.price || 0;
        subtotal += price * item.quantity;
        
        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: price,
          discount: 0,
          pvPoints: 0,
        });
      }
      
      const orderData: IOrderCreate = {
        userId: '0', // Will be set by backend from auth
        items: orderItems,
        total: subtotal, // Add tax/shipping as needed
        subtotal: subtotal,
        discount: 0,
        tax: 0,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: data.paymentMethod,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        notes: data.notes,
      };
      
      return await this.createOrder(orderData);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const orderService = new OrderService('/orders');