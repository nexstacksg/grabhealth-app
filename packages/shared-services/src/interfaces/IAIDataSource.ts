import {
  IProduct,
  ChatMessage,
  ChatResponse,
  RecommendationRequest,
  RecommendationResponse,
} from '@app/shared-types';

export interface ChatbotResponse {
  response: string;
  sessionId: string;
  suggestedActions?: Array<{
    text: string;
    action: string;
    data?: any;
  }>;
}

export interface InteractionData {
  userId?: number;
  productId: number;
  interactionType: 'view' | 'add_to_cart' | 'purchase' | 'share' | 'review';
  metadata?: any;
}

export interface IAIDataSource {
  sendChatMessage(message: string, conversationHistory?: ChatMessage[]): Promise<ChatResponse>;
  getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse>;
  getPersonalizedRecommendations(params?: { limit?: number; category?: string }): Promise<IProduct[]>;
  getSimilarProducts(productId: number, params?: { limit?: number }): Promise<IProduct[]>;
  getTrendingProducts(params?: { limit?: number }): Promise<IProduct[]>;
  sendChatbotMessage(message: string, sessionId?: string): Promise<ChatbotResponse>;
  getChatHistory(sessionId: string): Promise<ChatMessage[]>;
  clearChatHistory(sessionId: string): Promise<void>;
  getSearchSuggestions(query: string): Promise<string[]>;
  recordInteraction(data: InteractionData): Promise<void>;
}