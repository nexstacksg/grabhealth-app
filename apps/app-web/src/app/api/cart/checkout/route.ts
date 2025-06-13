import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { convertCartToOrder } from '@/lib/cart';

// POST /api/cart/checkout - Convert cart to order
export async function POST() {
  try {
    // Get current user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Convert cart to order
    const orderId = await convertCartToOrder(user.id);

    if (!orderId) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Error checking out cart:', error);
    return NextResponse.json({ error: 'Failed to checkout' }, { status: 500 });
  }
}
