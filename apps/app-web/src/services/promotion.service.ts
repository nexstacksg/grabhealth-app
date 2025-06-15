import { apiClient } from './api-client';
import {
  IPromotion,
  CreatePromotionRequest,
  ValidatePromotionResponse,
} from '@app/shared-types';

class PromotionService {
  private baseUrl = '/promotions';

  /**
   * Get all promotions
   */
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
    return await apiClient.get<{
      promotions: IPromotion[];
      total: number;
      page: number;
      totalPages: number;
    }>(this.baseUrl, { params });
  }

  /**
   * Get promotion by ID
   */
  async getPromotion(id: number): Promise<IPromotion> {
    return await apiClient.get<IPromotion>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get promotion by code
   */
  async getPromotionByCode(code: string): Promise<IPromotion> {
    return await apiClient.get<IPromotion>(
      `${this.baseUrl}/code/${code}`
    );
  }

  /**
   * Validate promotion code
   */
  async validatePromotion(
    code: string,
    orderTotal: number
  ): Promise<ValidatePromotionResponse> {
    return await apiClient.post<ValidatePromotionResponse>(
      `${this.baseUrl}/validate`,
      { code, orderTotal }
    );
  }

  /**
   * Create new promotion (admin only)
   */
  async createPromotion(
    data: CreatePromotionRequest
  ): Promise<IPromotion> {
    return await apiClient.post<IPromotion>(this.baseUrl, data);
  }

  /**
   * Update promotion (admin only)
   */
  async updatePromotion(
    id: number,
    data: Partial<CreatePromotionRequest>
  ): Promise<IPromotion> {
    return await apiClient.put<IPromotion>(
      `${this.baseUrl}/${id}`,
      data
    );
  }

  /**
   * Delete promotion (admin only)
   */
  async deletePromotion(id: number): Promise<void> {
    await apiClient.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Apply promotion to cart
   */
  async applyPromotionToCart(code: string): Promise<{
    success: boolean;
    discount: number;
    message?: string;
  }> {
    return await apiClient.post<{
      success: boolean;
      discount: number;
      message?: string;
    }>(`${this.baseUrl}/apply`, { code });
  }

  /**
   * Get active promotions for display
   */
  async getActivePromotions(): Promise<IPromotion[]> {
    return await apiClient.get<IPromotion[]>(
      `${this.baseUrl}/active`
    );
  }
}

export const promotionService = new PromotionService();
export default promotionService;