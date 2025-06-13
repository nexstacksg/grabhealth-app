import { IProduct } from '../models';

// AI Service Types
export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface IChatResponse {
  message: string;
  suggestedProducts?: IProduct[];
  needsMoreInfo?: boolean;
  followUpQuestions?: string[];
}

export interface IRecommendationRequest {
  userId?: string;
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  preferences?: string[];
  excludeProducts?: number[];
}

export interface IRecommendationResponse {
  products: IProduct[];
  reason: string;
  confidence: number;
}

// Backward compatibility exports (without I prefix)
export type ChatMessage = IChatMessage;
export type ChatResponse = IChatResponse;
export type RecommendationRequest = IRecommendationRequest;
export type RecommendationResponse = IRecommendationResponse;