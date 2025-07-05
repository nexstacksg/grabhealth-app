import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Internal API endpoint for creating orders from webhooks
// This bypasses user authentication since webhooks don't have cookies

interface CreateOrderRequest {
  secret: string;
  userId: string;
  orderNumber: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    discount?: number;
    pvPoints?: number;
  }>;
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: string;
  billingAddress: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as CreateOrderRequest;
    
    console.log('=== INTERNAL API: Order creation request received ===', {
      userId: data.userId,
      orderNumber: data.orderNumber,
      total: data.total,
      itemCount: data.items.length,
    });
    
    // Verify internal secret to ensure this endpoint is only called by our webhooks
    const internalSecret = process.env.INTERNAL_API_SECRET || 'dev-secret-change-in-production';
    const expectedSecret = crypto.createHash('sha256').update(internalSecret).digest('hex');
    
    if (data.secret !== expectedSecret) {
      console.error('=== INTERNAL API ERROR: Invalid secret ===');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
    
    // Use the Strapi API token from environment variable
    const strapiApiToken = process.env.STRAPI_API_TOKEN;
    
    if (!strapiApiToken) {
      console.error('STRAPI_API_TOKEN not configured');
      return NextResponse.json(
        { error: 'API token not configured' },
        { status: 500 }
      );
    }
    
    // Create the order with authentication
    const orderData = {
      data: {
        orderNumber: data.orderNumber,
        user: {
          connect: [data.userId] // Connect using documentId
        },
        total: data.total,
        subtotal: data.subtotal,
        discount: data.discount || 0,
        tax: data.tax || 0,
        status: data.status,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        notes: data.notes || '',
      }
    };
    
    console.log('=== INTERNAL API: Sending to Strapi ===', {
      url: `${baseUrl}/api/orders`,
      orderNumber: data.orderNumber,
      userId: data.userId,
      total: data.total,
      hasToken: !!strapiApiToken,
    });
    
    const orderResponse = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${strapiApiToken}`,
      },
      body: JSON.stringify(orderData),
    });
    
    const orderResult = await orderResponse.json();
    
    if (!orderResponse.ok) {
      console.error('=== INTERNAL API ERROR: Strapi order creation failed ===', {
        status: orderResponse.status,
        statusText: orderResponse.statusText,
        error: orderResult,
        orderData: orderData,
      });
      return NextResponse.json(
        { error: orderResult?.error?.message || 'Failed to create order' },
        { status: orderResponse.status }
      );
    }
    
    const createdOrder = orderResult.data;
    
    // Create order items
    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        try {
          const itemData = {
            data: {
              order: {
                connect: [createdOrder.documentId]
              },
              product: {
                connect: [item.productId]
              },
              quantity: item.quantity,
              price: item.price,
              discount: item.discount || 0,
              pvPoints: item.pvPoints || 0,
            }
          };
          
          const itemResponse = await fetch(`${baseUrl}/api/order-items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${strapiApiToken}`,
            },
            body: JSON.stringify(itemData),
          });
          
          if (!itemResponse.ok) {
            const itemError = await itemResponse.json();
            console.error('Failed to create order item:', itemError);
          }
        } catch (error) {
          console.error('Error creating order item:', error);
        }
      }
    }
    
    console.log('=== INTERNAL API: Order created successfully ===', {
      orderId: createdOrder?.documentId || createdOrder?.id,
      orderNumber: data.orderNumber,
      fullResponse: JSON.stringify(createdOrder),
    });
    
    return NextResponse.json({
      success: true,
      order: createdOrder,
    });
    
  } catch (error) {
    console.error('Internal order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}