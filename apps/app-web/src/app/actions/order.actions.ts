'use server';

import { serverApiGet, serverApiPost, serverApiPut } from '@/lib/server-api';
import { getCurrentUserAction } from './auth.actions';
import { IOrderCreate } from '@app/shared-types';

/**
 * Server action to fetch current user's orders
 * Filters orders by authenticated user ID
 */
export async function getMyOrdersAction(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  try {
    // Get current user first
    const userResult = await getCurrentUserAction();
    if (!userResult.success || !userResult.user) {
      return {
        success: false,
        orders: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }

    // Build query params
    const queryParams = new URLSearchParams();
    
    // Filter by current user ID
    queryParams.append('filters[user][id][$eq]', userResult.user.id.toString());
    
    if (params?.status) {
      queryParams.append('filters[status][$eq]', params.status);
    }
    
    if (params?.page) {
      queryParams.append('pagination[page]', params.page.toString());
    }
    
    if (params?.limit) {
      queryParams.append('pagination[pageSize]', params.limit.toString());
    }
    
    // Populate relations using Strapi 5 syntax
    queryParams.append('populate[user][fields]', 'id,username,email');
    queryParams.append('populate[items][populate]', 'product');
    
    // Sort by creation date (newest first)
    queryParams.append('sort', 'createdAt:desc');

    const result = await serverApiGet(`/orders?${queryParams.toString()}`);
    
    if (result.success && result.data) {
      const pagination = result.data.meta?.pagination || {};
      return {
        success: true,
        orders: result.data.data || [],
        total: pagination.total || 0,
        page: pagination.page || 1,
        totalPages: pagination.pageCount || 1,
      };
    }
    
    return {
      success: false,
      orders: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return {
      success: false,
      orders: [],
      total: 0,
      page: 1,
      totalPages: 0,
      error: error.message || 'Failed to fetch orders',
    };
  }
}

/**
 * Server action to get a single order by ID
 * Verifies the order belongs to the authenticated user
 */
export async function getOrderAction(orderId: string) {
  try {
    // Build query params for proper population
    const queryParams = new URLSearchParams();
    queryParams.append('populate[user][fields]', 'id,username,email');
    queryParams.append('populate[items][populate]', 'product');
    
    const result = await serverApiGet(`/orders/${orderId}?${queryParams.toString()}`);
    
    if (result.success && result.data) {
      // Verify the order belongs to the current user
      const userResult = await getCurrentUserAction();
      if (!userResult.success || !userResult.user) {
        return { success: false, error: 'Authentication required' };
      }
      
      const order = result.data.data || result.data;
      if (order.user?.id !== userResult.user.id) {
        return { success: false, error: 'Order not found' };
      }
      
      return { success: true, order };
    }
    
    return { success: false, error: 'Order not found' };
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch order',
    };
  }
}

/**
 * Server action to create a new order
 */
export async function createOrderAction(data: IOrderCreate) {
  try {
    // Transform data to Strapi format
    const strapiData = {
      data: {
        user: parseInt(data.userId), // Strapi uses numeric IDs
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

    const result = await serverApiPost('/orders', strapiData);
    
    if (result.success && result.data) {
      const order = result.data.data || result.data;
      
      // Create order items
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          await serverApiPost('/order-items', {
            data: {
              order: order.id,
              product: item.productId,
              quantity: item.quantity,
              price: item.price,
              discount: item.discount || 0,
              pvPoints: item.pvPoints || 0,
            }
          });
        }
      }
      
      return { success: true, order };
    }
    
    return { 
      success: false, 
      error: result.error || 'Failed to create order' 
    };
  } catch (error: any) {
    console.error('Error creating order:', error);
    return {
      success: false,
      error: error.message || 'Failed to create order',
    };
  }
}

/**
 * Server action to cancel an order
 */
export async function cancelOrderAction(orderId: string) {
  try {
    // First verify the order belongs to the current user
    const orderResult = await getOrderAction(orderId);
    if (!orderResult.success) {
      return orderResult;
    }
    
    // Update order status to CANCELLED
    const result = await serverApiPut(`/orders/${orderId}`, {
      data: {
        status: 'CANCELLED',
      }
    });
    
    if (result.success && result.data) {
      return { success: true, order: result.data.data || result.data };
    }
    
    return { 
      success: false, 
      error: result.error || 'Failed to cancel order' 
    };
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return {
      success: false,
      error: error.message || 'Failed to cancel order',
    };
  }
}