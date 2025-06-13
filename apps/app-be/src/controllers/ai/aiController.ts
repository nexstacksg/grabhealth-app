import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth/authenticate';
import { AIService } from '../../services/ai.service';
import prisma from '../../database/client';

const aiService = new AIService(prisma);

export const aiController = {
  // GET /api/v1/ai/recommend
  async getPersonalizedRecommendations(req: AuthRequest, res: Response) {
    try {
      const { limit = '4', category } = req.query;
      const userId = req.user?.id;

      const recommendations = await aiService.getPersonalizedRecommendations(
        userId,
        { limit: Number(limit), category: category as string }
      );

      res.json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get recommendations',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      });
    }
  },

  // GET /api/v1/ai/similar/:productId
  async getSimilarProducts(req: AuthRequest, res: Response) {
    try {
      const { productId } = req.params;
      const { limit = '4' } = req.query;

      const similarProducts = await aiService.getSimilarProducts(
        parseInt(productId, 10),
        { limit: Number(limit) }
      );

      res.json({
        success: true,
        data: similarProducts,
      });
    } catch (error) {
      console.error('Error getting similar products:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get similar products',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      });
    }
  },

  // GET /api/v1/ai/trending
  async getTrendingProducts(req: AuthRequest, res: Response) {
    try {
      const { limit = '4' } = req.query;

      const trendingProducts = await aiService.getTrendingProducts({ limit: Number(limit) });

      res.json({
        success: true,
        data: trendingProducts,
      });
    } catch (error) {
      console.error('Error getting trending products:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get trending products',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      });
    }
  },

  // POST /api/v1/ai/track
  async recordInteraction(req: AuthRequest, res: Response) {
    try {
      const { productId, interactionType, metadata } = req.body;
      const userId = req.user?.id;

      await aiService.recordInteraction(userId, {
        productId,
        interactionType,
        metadata,
      });

      res.json({
        success: true,
        message: 'Interaction recorded successfully',
      });
    } catch (error) {
      console.error('Error recording interaction:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to record interaction',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      });
    }
  },

  // POST /api/v1/ai/search-suggestions
  async getSearchSuggestions(req: AuthRequest, res: Response) {
    try {
      const { query, limit } = req.body;

      const suggestions = await aiService.getSearchSuggestions(query, { limit });

      res.json({
        success: true,
        data: suggestions,
      });
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get search suggestions',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      });
    }
  },
};