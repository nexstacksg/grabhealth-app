import {
  IProduct,
  ChatMessage,
  ChatResponse,
  RecommendationRequest,
  RecommendationResponse,
} from '@app/shared-types';
import {
  IAIDataSource,
  ChatbotResponse,
  InteractionData,
} from '../interfaces/IAIDataSource';
import { ServiceOptions } from '../types';

export interface AIServiceOptions extends ServiceOptions {
  dataSource: IAIDataSource;
}

export class AIService {
  private dataSource: IAIDataSource;

  constructor(options: AIServiceOptions) {
    this.dataSource = options.dataSource;
  }

  /**
   * Send message to AI chat
   */
  async sendChatMessage(
    message: string,
    conversationHistory?: ChatMessage[]
  ): Promise<ChatResponse> {
    if (!message?.trim()) {
      throw new Error('Message is required');
    }

    return this.dataSource.sendChatMessage(message.trim(), conversationHistory);
  }

  /**
   * Get product recommendations
   */
  async getRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    if (!request) {
      throw new Error('Recommendation request is required');
    }

    return this.dataSource.getRecommendations(request);
  }

  /**
   * Get personalized recommendations for user
   */
  async getPersonalizedRecommendations(params?: {
    limit?: number;
    category?: string;
  }): Promise<IProduct[]> {
    const validatedParams: any = {};

    if (params?.limit !== undefined) {
      if (params.limit < 1 || params.limit > 100) {
        throw new Error('Limit must be between 1 and 100');
      }
      validatedParams.limit = params.limit;
    }

    if (params?.category) {
      validatedParams.category = params.category.trim();
    }

    return this.dataSource.getPersonalizedRecommendations(validatedParams);
  }

  /**
   * Get similar products based on a product
   */
  async getSimilarProducts(
    productId: number,
    params?: { limit?: number }
  ): Promise<IProduct[]> {
    if (!productId || productId <= 0) {
      throw new Error('Valid product ID is required');
    }

    const validatedParams: any = {};

    if (params?.limit !== undefined) {
      if (params.limit < 1 || params.limit > 100) {
        throw new Error('Limit must be between 1 and 100');
      }
      validatedParams.limit = params.limit;
    }

    return this.dataSource.getSimilarProducts(productId, validatedParams);
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(params?: { limit?: number }): Promise<IProduct[]> {
    const validatedParams: any = {};

    if (params?.limit !== undefined) {
      if (params.limit < 1 || params.limit > 100) {
        throw new Error('Limit must be between 1 and 100');
      }
      validatedParams.limit = params.limit;
    }

    return this.dataSource.getTrendingProducts(validatedParams);
  }

  /**
   * Get both personalized recommendations and trending products
   * This method includes error handling and fallback logic extracted from useAIRecommendations hook
   */
  async getRecommendationsWithFallback(params?: { limit?: number }): Promise<{
    recommendations: IProduct[];
    trending: IProduct[];
    error: string | null;
  }> {
    const limit = params?.limit || 4;
    let recommendations: IProduct[] = [];
    let trending: IProduct[] = [];
    let error: string | null = null;

    try {
      const [personalizedRecs, trendingProds] = await Promise.all([
        this.getPersonalizedRecommendations({ limit }),
        this.getTrendingProducts({ limit }),
      ]);
      recommendations = personalizedRecs;
      trending = trendingProds;
    } catch (err: any) {
      console.error('Error fetching AI recommendations:', err);

      // Provide user-friendly error messages
      if (err.code === 'NETWORK_ERROR') {
        error =
          'Unable to connect to the server. Please check your internet connection.';
      } else if (err.code === 'INVALID_RESPONSE') {
        error = 'Server returned an invalid response. Please try again later.';
      } else if (err.statusCode === 404) {
        error = 'AI recommendations service is not available.';
      } else {
        error = 'Failed to load recommendations. Please try again later.';
      }

      // Set empty arrays on error to prevent UI issues
      recommendations = [];
      trending = [];
    }

    return { recommendations, trending, error };
  }

  /**
   * Send message to chatbot
   */
  async sendChatbotMessage(
    message: string,
    sessionId?: string
  ): Promise<ChatbotResponse> {
    if (!message?.trim()) {
      throw new Error('Message is required');
    }

    return this.dataSource.sendChatbotMessage(message.trim(), sessionId);
  }

  /**
   * Get chatbot conversation history
   */
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    if (!sessionId?.trim()) {
      throw new Error('Session ID is required');
    }

    return this.dataSource.getChatHistory(sessionId.trim());
  }

  /**
   * Clear chatbot conversation
   */
  async clearChatHistory(sessionId: string): Promise<void> {
    if (!sessionId?.trim()) {
      throw new Error('Session ID is required');
    }

    return this.dataSource.clearChatHistory(sessionId.trim());
  }

  /**
   * Get product search suggestions
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query?.trim()) {
      throw new Error('Search query is required');
    }

    if (query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }

    return this.dataSource.getSearchSuggestions(query.trim());
  }

  /**
   * Record user interaction for ML training
   */
  async recordInteraction(data: InteractionData): Promise<void> {
    if (!data) {
      throw new Error('Interaction data is required');
    }

    if (!data.productId || data.productId <= 0) {
      throw new Error('Valid product ID is required');
    }

    const validInteractionTypes = [
      'view',
      'add_to_cart',
      'purchase',
      'share',
      'review',
    ];
    if (!validInteractionTypes.includes(data.interactionType)) {
      throw new Error(
        `Invalid interaction type. Must be one of: ${validInteractionTypes.join(', ')}`
      );
    }

    try {
      await this.dataSource.recordInteraction(data);
    } catch (error) {
      // Don't throw errors for interaction recording - just log them
      console.warn('Failed to record interaction:', error);
    }
  }
}
