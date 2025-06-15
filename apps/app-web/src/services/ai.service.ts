import { apiClient } from './api-client';
import {
  IProduct,
  ChatMessage,
  ChatResponse,
  RecommendationRequest,
  RecommendationResponse,
} from '@app/shared-types';

class AIService {
  private chatBaseUrl = '/ai/chat';
  private recommendBaseUrl = '/ai';
  private chatbotBaseUrl = '/chatbot';

  /**
   * Send message to AI chat
   */
  async sendChatMessage(
    message: string,
    conversationHistory?: ChatMessage[]
  ): Promise<ChatResponse> {
    return await apiClient.post<ChatResponse>(this.chatBaseUrl, {
      message,
      history: conversationHistory,
    });
  }

  /**
   * Get product recommendations
   */
  async getRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    return await apiClient.post<RecommendationResponse>(
      this.recommendBaseUrl,
      request
    );
  }

  /**
   * Get personalized recommendations for user
   */
  async getPersonalizedRecommendations(params?: {
    limit?: number;
    category?: string;
  }): Promise<IProduct[]> {
    return await apiClient.get<IProduct[]>(
      `${this.recommendBaseUrl}/recommend`,
      { params }
    );
  }

  /**
   * Get similar products based on a product
   */
  async getSimilarProducts(
    productId: number,
    params?: { limit?: number }
  ): Promise<IProduct[]> {
    return await apiClient.get<IProduct[]>(
      `${this.recommendBaseUrl}/similar/${productId}`,
      { params }
    );
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(params?: { limit?: number }): Promise<IProduct[]> {
    return await apiClient.get<IProduct[]>(
      `${this.recommendBaseUrl}/trending`,
      { params }
    );
  }

  /**
   * Send message to chatbot
   */
  async sendChatbotMessage(
    message: string,
    sessionId?: string
  ): Promise<{
    response: string;
    sessionId: string;
    suggestedActions?: Array<{
      text: string;
      action: string;
      data?: any;
    }>;
  }> {
    return await apiClient.post<{
      response: string;
      sessionId: string;
      suggestedActions?: Array<{
        text: string;
        action: string;
        data?: any;
      }>;
    }>(this.chatbotBaseUrl, {
      message,
      sessionId,
    });
  }

  /**
   * Get chatbot conversation history
   */
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    return await apiClient.get<ChatMessage[]>(
      `${this.chatbotBaseUrl}/history/${sessionId}`
    );
  }

  /**
   * Clear chatbot conversation
   */
  async clearChatHistory(sessionId: string): Promise<void> {
    return await apiClient.delete<void>(
      `${this.chatbotBaseUrl}/history/${sessionId}`
    );
  }

  /**
   * Get product search suggestions
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    return await apiClient.post<string[]>(
      `${this.recommendBaseUrl}/search-suggestions`,
      { query, limit: 5 }
    );
  }

  /**
   * Record user interaction for ML training
   */
  async recordInteraction(data: {
    userId?: number;
    productId: number;
    interactionType: 'view' | 'add_to_cart' | 'purchase' | 'share' | 'review';
    metadata?: any;
  }): Promise<void> {
    try {
      await apiClient.post<void>(`${this.recommendBaseUrl}/track`, {
        productId: data.productId,
        interactionType: data.interactionType,
        metadata: data.metadata,
      });
    } catch (error) {
      // Don't throw errors for interaction recording
      console.warn('Failed to record interaction:', error);
    }
  }
}

export const aiService = new AIService();
export default aiService;