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
    console.log('HitPay Configuration:', {
      mode: HITPAY_MODE,
      apiKeyPrefix: HITPAY_API_KEY ? HITPAY_API_KEY.substring(0, 20) + '...' : 'NOT SET',
      apiUrl: getHitPayApiUrl(HITPAY_MODE),
      hasApiKey: !!HITPAY_API_KEY,
      hasSalt: !!HITPAY_SALT,
      hasWebhookSalt: !!HITPAY_WEBHOOK_SALT,
    });
    
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
        mode: HITPAY_MODE,
        apiUrl: this.apiUrl,
        apiKeyUsed: this.apiKey.substring(0, 20) + '...',
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
    if (!HITPAY_SALT) {
      throw new Error('HitPay salt is not configured');
    }

    // Create a copy of payload without the hmac field
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(payload)) {
      if (key !== 'hmac') {
        params[key] = value?.toString() || '';
      }
    }

    // Create HMAC source array following HitPay's PHP example
    const hmacSource: string[] = [];
    for (const [key, val] of Object.entries(params)) {
      hmacSource.push(`${key}${val}`);
    }
    
    // Sort alphabetically by the combined key+value string
    hmacSource.sort();
    
    // Join all strings together
    const sig = hmacSource.join('');
    
    // Generate HMAC-SHA256
    const computedHmac = crypto
      .createHmac('sha256', HITPAY_SALT)
      .update(sig)
      .digest('hex');

    console.log('Payment Request Webhook Verification Debug:', {
      params,
      hmacSource,
      signatureString: sig,
      computedHmac,
      receivedSignature: signature,
      match: computedHmac === signature
    });

    return computedHmac === signature;
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

// Lazy initialization to avoid build errors when env vars are not available
let _hitpayClient: HitPayClient | null = null;

export const hitpayClient = {
  createPaymentRequest: async (params: HitPayPaymentRequest): Promise<HitPayPaymentResponse> => {
    if (!_hitpayClient) {
      _hitpayClient = new HitPayClient();
    }
    return _hitpayClient.createPaymentRequest(params);
  },
  
  getPaymentStatus: async (paymentRequestId: string): Promise<any> => {
    if (!_hitpayClient) {
      _hitpayClient = new HitPayClient();
    }
    return _hitpayClient.getPaymentStatus(paymentRequestId);
  },
  
  verifyWebhookSignature: (payload: any, signature: string): boolean => {
    if (!_hitpayClient) {
      _hitpayClient = new HitPayClient();
    }
    return _hitpayClient.verifyWebhookSignature(payload, signature);
  },
  
  generateSignature: (params: Record<string, any>): string => {
    if (!_hitpayClient) {
      _hitpayClient = new HitPayClient();
    }
    return _hitpayClient.generateSignature(params);
  }
};