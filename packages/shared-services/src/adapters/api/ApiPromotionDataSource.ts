import {
  IPromotion,
  CreatePromotionRequest,
  ValidatePromotionResponse,
} from '@app/shared-types';
import { IPromotionDataSource } from '../../interfaces/IPromotionDataSource';
import { BaseApiDataSource } from './BaseApiDataSource';

export class ApiPromotionDataSource extends BaseApiDataSource implements IPromotionDataSource {

  async getPromotions(params?: {
    page?: number;
    limit?: number;
    active?: boolean;
  }): Promise<{
    promotions: IPromotion[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.get<{
      promotions: IPromotion[];
      total: number;
      page: number;
      totalPages: number;
    }>('/promotions', params);
  }

  async getPromotion(id: number): Promise<IPromotion> {
    return this.get<IPromotion>(`/promotions/${id}`);
  }

  async getPromotionByCode(code: string): Promise<IPromotion> {
    return this.get<IPromotion>(`/promotions/code/${code}`);
  }

  async validatePromotion(code: string, orderTotal: number): Promise<ValidatePromotionResponse> {
    return this.post<ValidatePromotionResponse>('/promotions/validate', { code, orderTotal });
  }

  async createPromotion(data: CreatePromotionRequest): Promise<IPromotion> {
    return this.post<IPromotion>('/promotions', data);
  }

  async updatePromotion(id: number, data: Partial<CreatePromotionRequest>): Promise<IPromotion> {
    return this.put<IPromotion>(`/promotions/${id}`, data);
  }

  async deletePromotion(id: number): Promise<void> {
    return this.delete<void>(`/promotions/${id}`);
  }

  async applyPromotionToCart(code: string): Promise<{
    success: boolean;
    discount: number;
    message?: string;
  }> {
    return this.post<{
      success: boolean;
      discount: number;
      message?: string;
    }>('/promotions/apply', { code });
  }

  async getActivePromotions(): Promise<IPromotion[]> {
    return this.get<IPromotion[]>('/promotions/active');
  }
}