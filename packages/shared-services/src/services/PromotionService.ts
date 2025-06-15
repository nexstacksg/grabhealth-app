import {
  IPromotion,
  CreatePromotionRequest,
  ValidatePromotionResponse,
} from '@app/shared-types';
import { IPromotionDataSource } from '../interfaces/IPromotionDataSource';

export interface PromotionServiceOptions {
  dataSource: IPromotionDataSource;
}

export class PromotionService {
  private dataSource: IPromotionDataSource;

  constructor(options: PromotionServiceOptions) {
    this.dataSource = options.dataSource;
  }

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
    return await this.dataSource.getPromotions(params);
  }

  async getPromotion(id: number): Promise<IPromotion> {
    return await this.dataSource.getPromotion(id);
  }

  async getPromotionByCode(code: string): Promise<IPromotion> {
    return await this.dataSource.getPromotionByCode(code);
  }

  async validatePromotion(code: string, orderTotal: number): Promise<ValidatePromotionResponse> {
    return await this.dataSource.validatePromotion(code, orderTotal);
  }

  async createPromotion(data: CreatePromotionRequest): Promise<IPromotion> {
    return await this.dataSource.createPromotion(data);
  }

  async updatePromotion(id: number, data: Partial<CreatePromotionRequest>): Promise<IPromotion> {
    return await this.dataSource.updatePromotion(id, data);
  }

  async deletePromotion(id: number): Promise<void> {
    return await this.dataSource.deletePromotion(id);
  }

  async applyPromotionToCart(code: string): Promise<{
    success: boolean;
    discount: number;
    message?: string;
  }> {
    return await this.dataSource.applyPromotionToCart(code);
  }

  async getActivePromotions(): Promise<IPromotion[]> {
    return await this.dataSource.getActivePromotions();
  }
}