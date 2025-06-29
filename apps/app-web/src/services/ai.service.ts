/**
 * AI Service - Handles all AI related API calls
 */


import { BaseService } from './base.service';
import { IProduct, ApiResponse } from '@app/shared-types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ChatResponse {
  message: string;
  suggestions?: string[];
}

interface ChatContext {
  productId?: string;
  categoryId?: string;
  orderId?: string;
}

interface ChatbotResponse extends ChatResponse {
  actions?: {
    type: string;
    payload: any;
  }[];
}

interface ChatHistory {
  messages: ChatMessage[];
  sessionId: string;
}

interface Interaction {
  type: 'view' | 'click' | 'purchase' | 'search';
  productId?: string;
  categoryId?: string;
  query?: string;
  metadata?: Record<string, any>;
}

// Backend interface for interaction tracking
interface BackendInteraction {
  productId: number;
  interactionType: 'view' | 'add_to_cart' | 'purchase' | 'share' | 'review';
  metadata?: Record<string, any>;
}

class AIService extends BaseService {
  async sendChatMessage(message: string): Promise<ChatResponse> {
    try {
      const response = await this.api.post<ApiResponse<ChatResponse>>(
        '/ai/chat',
        { message }
      );
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getRecommendations(userId?: string): Promise<IProduct[]> {
    try {
      const params = userId ? { userId } : {};
      const queryString = this.buildQueryString(params);
      const response = await this.api.get<ApiResponse<IProduct[]>>(
        `/ai/recommendations${queryString}`
      );
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPersonalizedRecommendations(): Promise<IProduct[]> {
    try {
      const response = await this.api.get<ApiResponse<IProduct[]>>(
        '/ai/recommendations/personalized'
      );
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getSimilarProducts(
    productId: number,
    options: { limit?: number } = {}
  ): Promise<IProduct[]> {
    try {
      const { limit = 4 } = options;
      const queryString = this.buildQueryString({ limit });
      const response = await this.api.get<ApiResponse<IProduct[]>>(
        `/ai/similar/${productId}${queryString}`
      );
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getTrendingProducts(limit: number = 8): Promise<IProduct[]> {
    try {
      const queryString = this.buildQueryString({ limit });
      const response = await this.api.get<ApiResponse<IProduct[]>>(
        `/ai/trending${queryString}`
      );
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async sendChatbotMessage(
    message: string,
    context?: ChatContext
  ): Promise<ChatbotResponse> {
    try {
      const response = await this.api.post<ApiResponse<ChatbotResponse>>(
        '/ai/chatbot',
        { message, context }
      );
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getChatHistory(): Promise<ChatHistory> {
    try {
      const response =
        await this.api.get<ApiResponse<ChatHistory>>('/ai/chat-history');
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async clearChatHistory(): Promise<void> {
    try {
      await this.api.delete('/ai/chat-history');
    } catch (error) {
      this.handleError(error);
    }
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const response = await this.api.get<ApiResponse<string[]>>(
        `/ai/search-suggestions?q=${encodeURIComponent(query)}`
      );
      return this.extractData(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async recordInteraction(data: Interaction): Promise<void> {
    try {
      // Convert frontend interface to backend interface
      const backendData: BackendInteraction = {
        productId: parseInt(data.productId || '0'),
        interactionType:
          data.type === 'view'
            ? 'view'
            : data.type === 'click'
              ? 'view'
              : data.type === 'purchase'
                ? 'purchase'
                : 'view',
        metadata: data.metadata,
      };

      await this.api.post('/ai/track', backendData);
    } catch (error) {
      // Don't throw errors for tracking - just log them
      console.warn('Failed to record interaction:', error);
    }
  }
}

export const aiService = new AIService('/ai');
