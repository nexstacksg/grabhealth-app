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
    const response = await apiClient.get<{
      promotions: IPromotion[];
      total: number;
      page: number;
      totalPages: number;
    }>(this.baseUrl, { params });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch promotions');
    }

    return response.data;
  }

  /**
   * Get promotion by ID
   */
  async getPromotion(id: number): Promise<IPromotion> {
    const response = await apiClient.get<IPromotion>(`${this.baseUrl}/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch promotion');
    }

    return response.data;
  }

  /**
   * Get promotion by code
   */
  async getPromotionByCode(code: string): Promise<IPromotion> {
    const response = await apiClient.get<IPromotion>(
      `${this.baseUrl}/code/${code}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch promotion');
    }

    return response.data;
  }

  /**
   * Validate promotion code
   */
  async validatePromotion(
    code: string,
    orderTotal: number
  ): Promise<ValidatePromotionResponse> {
    const response = await apiClient.post<ValidatePromotionResponse>(
      `${this.baseUrl}/validate`,
      { code, orderTotal }
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to validate promotion'
      );
    }

    return response.data;
  }

  /**
   * Create new promotion (admin only)
   */
  async createPromotion(
    data: CreatePromotionRequest
  ): Promise<IPromotion> {
    const response = await apiClient.post<IPromotion>(this.baseUrl, data);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create promotion');
    }

    return response.data;
  }

  /**
   * Update promotion (admin only)
   */
  async updatePromotion(
    id: number,
    data: Partial<CreatePromotionRequest>
  ): Promise<IPromotion> {
    const response = await apiClient.put<IPromotion>(
      `${this.baseUrl}/${id}`,
      data
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update promotion');
    }

    return response.data;
  }

  /**
   * Delete promotion (admin only)
   */
  async deletePromotion(id: number): Promise<void> {
    const response = await apiClient.delete<void>(`${this.baseUrl}/${id}`);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete promotion');
    }
  }

  /**
   * Apply promotion to cart
   */
  async applyPromotionToCart(code: string): Promise<{
    success: boolean;
    discount: number;
    message?: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      discount: number;
      message?: string;
    }>(`${this.baseUrl}/apply`, { code });

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to apply promotion'
      );
    }

    return response.data;
  }

  /**
   * Get active promotions for display
   */
  async getActivePromotions(): Promise<IPromotion[]> {
    const response = await apiClient.get<IPromotion[]>(
      `${this.baseUrl}/active`
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to fetch active promotions'
      );
    }

    return response.data;
  }
}

export const promotionService = new PromotionService();
export default promotionService;