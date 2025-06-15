import {
  IProduct,
  ChatMessage,
  ChatResponse,
  RecommendationRequest,
  RecommendationResponse,
} from '@app/shared-types';
import { BaseApiDataSource } from './BaseApiDataSource';
import { IAIDataSource, ChatbotResponse, InteractionData } from '../../interfaces/IAIDataSource';

export class ApiAIDataSource extends BaseApiDataSource implements IAIDataSource {
  private readonly chatEndpoint = '/ai/chat';
  private readonly recommendEndpoint = '/ai';
  private readonly chatbotEndpoint = '/chatbot';

  async sendChatMessage(
    message: string,
    conversationHistory?: ChatMessage[]
  ): Promise<ChatResponse> {
    return this.post<ChatResponse>(this.chatEndpoint, {
      message,
      history: conversationHistory,
    });
  }

  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    return this.post<RecommendationResponse>(this.recommendEndpoint, request);
  }

  async getPersonalizedRecommendations(params?: {
    limit?: number;
    category?: string;
  }): Promise<IProduct[]> {
    return this.get<IProduct[]>(`${this.recommendEndpoint}/recommend`, params);
  }

  async getSimilarProducts(
    productId: number,
    params?: { limit?: number }
  ): Promise<IProduct[]> {
    return this.get<IProduct[]>(`${this.recommendEndpoint}/similar/${productId}`, params);
  }

  async getTrendingProducts(params?: { limit?: number }): Promise<IProduct[]> {
    return this.get<IProduct[]>(`${this.recommendEndpoint}/trending`, params);
  }

  async sendChatbotMessage(
    message: string,
    sessionId?: string
  ): Promise<ChatbotResponse> {
    return this.post<ChatbotResponse>(this.chatbotEndpoint, {
      message,
      sessionId,
    });
  }

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    return this.get<ChatMessage[]>(`${this.chatbotEndpoint}/history/${sessionId}`);
  }

  async clearChatHistory(sessionId: string): Promise<void> {
    return this.delete<void>(`${this.chatbotEndpoint}/history/${sessionId}`);
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    return this.post<string[]>(`${this.recommendEndpoint}/search-suggestions`, {
      query,
      limit: 5,
    });
  }

  async recordInteraction(data: InteractionData): Promise<void> {
    return this.post<void>(`${this.recommendEndpoint}/track`, {
      productId: data.productId,
      interactionType: data.interactionType,
      metadata: data.metadata,
    });
  }
}