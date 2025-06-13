import { NextResponse } from 'next/server';
import { getCurrentUser, initializeUsersTable } from '@/lib/auth';
import {
  getOrdersByUserId,
  initializeOrdersTables,
  addSampleOrders,
} from '@/lib/orders';

export async function GET() {
  try {
    // First initialize the users table to ensure it exists
    await initializeUsersTable();

    // Get current user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize orders tables if they don't exist
    await initializeOrdersTables();

    // Add sample orders for testing (only adds if no orders exist)
    await addSampleOrders(user.id);

    // Get orders for the current user
    const orders = await getOrdersByUserId(user.id);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
