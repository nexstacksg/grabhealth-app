import {
  IPromotion,
  CreatePromotionRequest,
  ValidatePromotionResponse,
} from '@app/shared-types';

export interface IPromotionDataSource {
  getPromotions(params?: {
    page?: number;
    limit?: number;
    active?: boolean;
  }): Promise<{
    promotions: IPromotion[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  getPromotion(id: number): Promise<IPromotion>;
  getPromotionByCode(code: string): Promise<IPromotion>;
  validatePromotion(code: string, orderTotal: number): Promise<ValidatePromotionResponse>;
  createPromotion(data: CreatePromotionRequest): Promise<IPromotion>;
  updatePromotion(id: number, data: Partial<CreatePromotionRequest>): Promise<IPromotion>;
  deletePromotion(id: number): Promise<void>;
  applyPromotionToCart(code: string): Promise<{
    success: boolean;
    discount: number;
    message?: string;
  }>;
  getActivePromotions(): Promise<IPromotion[]>;
}