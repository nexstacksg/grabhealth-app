'use server';

import { serverApiGet, serverApiPost, serverApiPut } from '@/lib/server-api';
import { getCurrentUserAction } from './auth.actions';
import { IOrderCreate, OrderStatus, PaymentStatus } from '@app/shared-types';

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
    
    // Get the raw user data to access the numeric ID
    const rawUserResult = await serverApiGet('/users/me');
    if (rawUserResult.success && rawUserResult.data) {
      const userId = rawUserResult.data.id;
      queryParams.append('filters[user][id][$eq]', userId.toString());
    }
    
    if (params?.status) {
      queryParams.append('filters[orderStatus][$eq]', params.status);
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
      // Transform orders - Strapi 5 already provides documentId
      const orders = result.data.data || [];
      return {
        success: true,
        orders,
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
    
    // In Strapi 5, we use documentId in the URL
    const result = await serverApiGet(`/orders/${orderId}?${queryParams.toString()}`);
    
    if (result.success && result.data) {
      // Verify the order belongs to the current user
      const userResult = await getCurrentUserAction();
      if (!userResult.success || !userResult.user) {
        return { success: false, error: 'Authentication required' };
      }
      
      const order = result.data.data || result.data;
      // Check user ownership - handle both string and number IDs
      const orderUserId = order.user?.documentId?.toString();
      const currentUserId = userResult.user.documentId.toString();
      
      if (!orderUserId || orderUserId !== currentUserId) {
        return { success: false, error: 'Order not found' };
      }
      
      // Return order as-is (already has documentId from Strapi)
      return { 
        success: true, 
        order
      };
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
    // Generate a unique order number
    const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    console.log('Creating order with data:', {
      userId: data.userId,
      orderNumber,
      total: data.total,
      status: data.status,
      paymentMethod: data.paymentMethod,
    });
    
    // Transform data to Strapi format
    // For Strapi 5, relations should use connect syntax
    const strapiData = {
      data: {
        orderNumber, // Add the required orderNumber field
        user: {
          connect: [data.userId] // Strapi 5 uses documentId
        },
        total: data.total,
        subtotal: data.subtotal,
        discount: data.discount || 0,
        tax: data.tax || 0,
        orderStatus: data.status || OrderStatus.PENDING_PAYMENT,
        paymentStatus: data.paymentStatus || PaymentStatus.PENDING,
        paymentMethod: data.paymentMethod,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        notes: data.notes || '',
      }
    };

    console.log('Sending to Strapi:', JSON.stringify(strapiData, null, 2));

    const result = await serverApiPost('/orders', strapiData);
    
    console.log('Order creation result:', {
      success: result.success,
      error: result.error,
      data: result.data ? 'Order created' : 'No data',
    });
    
    if (result.success && result.data) {
      const order = result.data.data || result.data;
      
      // Create order items
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          try {
            const itemData = {
              data: {
                order: {
                  // Strapi 5 requires documentId
                  connect: [order.documentId]
                },
                product: {
                  connect: [item.productId] // Products use documentId
                },
                quantity: item.quantity,
                price: item.price,
                discount: item.discount || 0,
              }
            };
            
            await serverApiPost('/order-items', itemData);
          } catch (error) {
            console.error('Failed to create order item:', error);
          }
        }
      }
      
      return { 
        success: true, 
        order: {
          ...order,
          documentId: order.documentId // Strapi 5 uses documentId
        }
      };
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
        orderStatus: OrderStatus.CANCELLED,
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

/**
 * Server action to update order status (used by webhooks)
 * This requires API token for now until we implement a better solution
 */
export async function updateOrderStatusAction(
  orderId: string,
  updates: {
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    paymentId?: string;
  }
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
    
    // For webhook updates, we need to use the API token temporarily
    // This is the minimal use of API token until we can implement a better solution
    const strapiToken = process.env.STRAPI_API_TOKEN;
    
    if (!strapiToken) {
      console.error('STRAPI_API_TOKEN not configured for webhook updates');
      return { success: false, error: 'API token not configured' };
    }
    
    // Prepare update data with proper typing
    const updateData = {
      data: {} as {
        orderStatus?: string;
        paymentStatus?: string;
        paymentMethod?: string;
      }
    };
    
    if (updates.status) updateData.data.orderStatus = updates.status;
    if (updates.paymentStatus) updateData.data.paymentStatus = updates.paymentStatus;
    if (updates.paymentMethod) updateData.data.paymentMethod = updates.paymentMethod;
    // Note: paymentId is not a field in Strapi order schema, so we don't include it
    
    console.log('Updating order status:', {
      orderId,
      updates: updateData.data,
    });
    
    // Update the order
    const updateResponse = await fetch(`${baseUrl}/api/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${strapiToken}`,
      },
      body: JSON.stringify(updateData),
    });
    
    const updateResult = await updateResponse.json();
    
    if (!updateResponse.ok) {
      console.error('Failed to update order:', updateResult);
      return { 
        success: false, 
        error: updateResult?.error?.message || 'Failed to update order' 
      };
    }
    
    return {
      success: true,
      order: updateResult.data,
    };
    
  } catch (error: any) {
    console.error('Order update error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update order',
    };
  }
}

/**
 * Server action to get order by order number (used by webhooks)
 */
export async function getOrderByOrderNumberAction(orderNumber: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
    
    // For webhook access, we need to use API token
    const strapiToken = process.env.STRAPI_API_TOKEN;
    
    if (!strapiToken) {
      console.error('STRAPI_API_TOKEN not configured');
      return { success: false, error: 'API token not configured' };
    }
    
    // Fetch order by order number
    const orderResponse = await fetch(
      `${baseUrl}/api/orders?filters[orderNumber][$eq]=${orderNumber}&populate=*`,
      {
        headers: {
          'Authorization': `Bearer ${strapiToken}`,
        },
      }
    );
    
    if (!orderResponse.ok) {
      return { success: false, error: 'Order not found' };
    }
    
    const orderData = await orderResponse.json();
    const orders = orderData.data || [];
    
    if (orders.length === 0) {
      return { success: false, error: 'Order not found' };
    }
    
    return {
      success: true,
      order: orders[0],
    };
    
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch order',
    };
  }
}