export interface HitPayConfig {
  apiKey: string;
  mode: 'sandbox' | 'live';
}

export const getHitPayConfig = (): HitPayConfig => {
  const apiKey = process.env.NEXT_PUBLIC_HITPAY_API_KEY;
  const mode = (process.env.NEXT_PUBLIC_HITPAY_MODE || 'sandbox') as 'sandbox' | 'live';

  if (!apiKey) {
    throw new Error('HitPay API key is not configured');
  }

  return { apiKey, mode };
};

export const getHitPayApiUrl = (mode: 'sandbox' | 'live' = 'sandbox'): string => {
  return mode === 'live' 
    ? 'https://api.hit-pay.com/v1' 
    : 'https://api.sandbox.hit-pay.com/v1';
};

export interface HitPayPaymentRequest {
  amount: string;
  currency: string;
  purpose: string;
  email?: string;
  name?: string;
  redirect_url: string;
  webhook?: string;
  reference_number?: string;
  allow_repeated_payments?: boolean;
  expiry_date?: string;
}

export interface HitPayPaymentResponse {
  id: string;
  url: string;
  status: string;
  request_id?: string;
}

export const formatAmount = (cents: number): string => {
  return (cents / 100).toFixed(2);
};