import { BaseService } from './base.service';
import { IOrder, IOrderCreate } from '@app/shared-types';

interface CreateCheckoutSessionParams {
  orderId?: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    productId: number;
    image?: string;
  }>;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

interface CheckoutSession {
  id: string;
  url: string;
  amount_total: number;
  currency: string;
  payment_status: string;
}

class PaymentService extends BaseService {
  /**
   * Create a Stripe checkout session
   * This should be called from a server action, not directly from client
   */
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSession> {
    try {
      // This endpoint should be implemented in your Strapi backend
      // or called via a server action that uses stripe-server.ts
      const response = await this.api.post<CheckoutSession>(
        '/payments/create-checkout-session',
        params
      );
      
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(sessionId: string): Promise<{
    paid: boolean;
    orderId?: string;
    amount?: number;
  }> {
    try {
      const response = await this.api.get<{
        paid: boolean;
        orderId?: string;
        amount?: number;
      }>(`/payments/verify/${sessionId}`);
      
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    payments: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) {
        queryParams.append('pagination[page]', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('pagination[pageSize]', params.limit.toString());
      }
      
      const response = await this.api.get<any>(
        `/payments?${queryParams.toString()}`
      );
      
      const pagination = response.meta?.pagination || {};
      
      return {
        payments: response.data || [],
        total: pagination.total || 0,
        page: pagination.page || 1,
        totalPages: pagination.pageCount || 1,
      };
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return {
        payments: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }
  }
}

export const paymentService = new PaymentService('/payments');