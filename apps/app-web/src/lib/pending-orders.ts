/**
 * Simple in-memory store for pending orders
 * In production, you should use Redis or a database table
 */

interface PendingOrder {
  referenceNumber: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    pvPoints?: number;
  }>;
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
  shippingAddress: string;
  billingAddress: string;
  notes?: string;
  createdAt: Date;
}

// In-memory store (will be lost on server restart)
// TODO: Replace with Redis or database in production
const pendingOrders = new Map<string, PendingOrder>();

// Clean up old pending orders (older than 1 hour)
const cleanupOldOrders = () => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (const [key, order] of pendingOrders.entries()) {
    if (order.createdAt < oneHourAgo) {
      pendingOrders.delete(key);
    }
  }
};

export const storePendingOrder = (order: PendingOrder): void => {
  cleanupOldOrders();
  pendingOrders.set(order.referenceNumber, order);
};

export const getPendingOrder = (referenceNumber: string): PendingOrder | undefined => {
  cleanupOldOrders();
  return pendingOrders.get(referenceNumber);
};

export const deletePendingOrder = (referenceNumber: string): void => {
  pendingOrders.delete(referenceNumber);
};