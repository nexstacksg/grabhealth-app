/**
 * Promotion Service - Handles all promotion related API calls
 */

import { apiClient } from './api-client';
import { BaseService } from './base.service';
import { ApiResponse } from '@app/shared-types';

interface IPromotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
}

interface ValidatePromotionResponse {
  valid: boolean;
  discountAmount?: number;
  message?: string;
}

interface CreatePromotionData {
  code: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  isActive?: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
}

class PromotionService extends BaseService {
  async getPromotions(params?: { active?: boolean }): Promise<IPromotion[]> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await apiClient.get<ApiResponse<IPromotion[]>>(`/promotions${queryString}`);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPromotion(id: string): Promise<IPromotion> {
    try {
      const response = await apiClient.get<ApiResponse<IPromotion>>(`/promotions/${id}`);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPromotionByCode(code: string): Promise<IPromotion> {
    try {
      const response = await apiClient.get<ApiResponse<IPromotion>>(`/promotions/code/${code}`);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async validatePromotion(code: string, orderTotal: number): Promise<ValidatePromotionResponse> {
    try {
      const response = await apiClient.post<ApiResponse<ValidatePromotionResponse>>('/promotions/validate', {
        code,
        orderTotal,
      });
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async applyPromotionToCart(code: string): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse>('/promotions/apply', { code });
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createPromotion(data: CreatePromotionData): Promise<IPromotion> {
    try {
      const response = await apiClient.post<ApiResponse<IPromotion>>('/admin/promotions', data);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updatePromotion(id: string, data: Partial<CreatePromotionData>): Promise<IPromotion> {
    try {
      const response = await apiClient.put<ApiResponse<IPromotion>>(`/admin/promotions/${id}`, data);
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deletePromotion(id: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/promotions/${id}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getActivePromotions(): Promise<IPromotion[]> {
    return this.getPromotions({ active: true });
  }
}

export const promotionService = new PromotionService('/promotions');