import crypto from 'crypto';
import { HitPayPaymentRequest, HitPayPaymentResponse, getHitPayApiUrl } from './hitpay';

const HITPAY_API_KEY = process.env.HITPAY_API_KEY!;
const HITPAY_SALT = process.env.HITPAY_SALT!;
const HITPAY_WEBHOOK_SALT = process.env.HITPAY_WEBHOOK_SALT!;
const HITPAY_MODE = (process.env.NEXT_PUBLIC_HITPAY_MODE || 'sandbox') as 'sandbox' | 'live';

export class HitPayClient {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    if (!HITPAY_API_KEY) {
      throw new Error('HitPay API key is not configured');
    }
    this.apiKey = HITPAY_API_KEY;
    this.apiUrl = getHitPayApiUrl(HITPAY_MODE);
  }

  async createPaymentRequest(params: HitPayPaymentRequest): Promise<HitPayPaymentResponse> {
    console.log('HitPay API Request:', {
      url: `${this.apiUrl}/payment-requests`,
      apiKey: this.apiKey.substring(0, 10) + '...', // Log first 10 chars only
      params,
    });

    const response = await fetch(`${this.apiUrl}/payment-requests`, {
      method: 'POST',
      headers: {
        'X-BUSINESS-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText };
      }
      console.error('HitPay API error response:', {
        status: response.status,
        statusText: response.statusText,
        error,
        requestParams: params,
      });
      throw new Error(`HitPay API error: ${error.message || error.error || response.statusText}`);
    }

    return response.json();
  }

  async getPaymentStatus(paymentRequestId: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/payment-requests/${paymentRequestId}`, {
      method: 'GET',
      headers: {
        'X-BUSINESS-API-KEY': this.apiKey,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText };
      }
      console.error('HitPay API error response:', {
        status: response.status,
        statusText: response.statusText,
        error,
        requestParams: params,
      });
      throw new Error(`HitPay API error: ${error.message || error.error || response.statusText}`);
    }

    return response.json();
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    if (!HITPAY_WEBHOOK_SALT) {
      throw new Error('HitPay webhook salt is not configured');
    }

    // Create the signature string according to HitPay docs
    const values = [
      payload.payment_id,
      payload.payment_request_id,
      payload.phone,
      payload.amount,
      payload.currency,
      payload.status,
      payload.reference_number || '',
    ];

    const signatureString = values.join('') + HITPAY_WEBHOOK_SALT;
    const computedSignature = crypto
      .createHash('sha256')
      .update(signatureString)
      .digest('hex');

    return computedSignature === signature;
  }

  generateSignature(params: Record<string, any>): string {
    if (!HITPAY_SALT) {
      throw new Error('HitPay salt is not configured');
    }

    // Sort parameters alphabetically
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        if (params[key] !== undefined && params[key] !== null) {
          acc[key] = params[key];
        }
        return acc;
      }, {} as Record<string, any>);

    // Create query string
    const queryString = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    // Generate HMAC signature
    return crypto
      .createHmac('sha256', HITPAY_SALT)
      .update(queryString)
      .digest('hex');
  }
}

export const hitpayClient = new HitPayClient();