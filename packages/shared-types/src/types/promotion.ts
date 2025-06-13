import { IPromotion } from '../models';

// Promotion Service Types
export interface ICreatePromotionRequest {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validFrom: Date;
  validTo: Date;
  usageLimit?: number;
  minimumPurchase?: number;
}

export interface IValidatePromotionResponse {
  valid: boolean;
  promotion?: IPromotion;
  message?: string;
  discountAmount?: number;
}

// Backward compatibility exports (without I prefix)
export type CreatePromotionRequest = ICreatePromotionRequest;
export type ValidatePromotionResponse = IValidatePromotionResponse;