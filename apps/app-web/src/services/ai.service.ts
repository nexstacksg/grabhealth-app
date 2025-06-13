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
    const response = await apiClient.post<ChatResponse>(this.chatBaseUrl, {
      message,
      history: conversationHistory,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to send chat message');
    }

    return response.data;
  }

  /**
   * Get product recommendations
   */
  async getRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    const response = await apiClient.post<RecommendationResponse>(
      this.recommendBaseUrl,
      request
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to get recommendations'
      );
    }

    return response.data;
  }

  /**
   * Get personalized recommendations for user
   */
  async getPersonalizedRecommendations(params?: {
    limit?: number;
    category?: string;
  }): Promise<IProduct[]> {
    const response = await apiClient.get<IProduct[]>(
      `${this.recommendBaseUrl}/recommend`,
      { params }
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to get personalized recommendations'
      );
    }

    return response.data;
  }

  /**
   * Get similar products based on a product
   */
  async getSimilarProducts(
    productId: number,
    params?: { limit?: number }
  ): Promise<IProduct[]> {
    const response = await apiClient.get<IProduct[]>(
      `${this.recommendBaseUrl}/similar/${productId}`,
      { params }
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to get similar products'
      );
    }

    return response.data;
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(params?: { limit?: number }): Promise<IProduct[]> {
    const response = await apiClient.get<IProduct[]>(
      `${this.recommendBaseUrl}/trending`,
      { params }
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to get trending products'
      );
    }

    return response.data;
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
    const response = await apiClient.post<{
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

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to send message');
    }

    return response.data;
  }

  /**
   * Get chatbot conversation history
   */
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const response = await apiClient.get<ChatMessage[]>(
      `${this.chatbotBaseUrl}/history/${sessionId}`
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to get chat history'
      );
    }

    return response.data;
  }

  /**
   * Clear chatbot conversation
   */
  async clearChatHistory(sessionId: string): Promise<void> {
    const response = await apiClient.delete<void>(
      `${this.chatbotBaseUrl}/history/${sessionId}`
    );

    if (!response.success) {
      throw new Error(
        response.error?.message || 'Failed to clear chat history'
      );
    }
  }

  /**
   * Get product search suggestions
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    const response = await apiClient.post<string[]>(
      `${this.recommendBaseUrl}/search-suggestions`,
      { query, limit: 5 }
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || 'Failed to get search suggestions'
      );
    }

    return response.data;
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