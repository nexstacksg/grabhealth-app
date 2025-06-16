import { Router } from 'express';
import { aiController } from '../../../controllers/ai/aiController';
import { authenticate } from '../../../middleware/auth/authenticate';

const router = Router();

// AI Recommendation endpoints
// Most endpoints are accessible without authentication for better UX
// Only interaction tracking requires authentication

// GET /api/v1/ai/recommend - Get personalized recommendations
router.get('/recommend', aiController.getPersonalizedRecommendations);

// GET /api/v1/ai/recommendations - Alias for personalized recommendations (for compatibility)
router.get('/recommendations', aiController.getPersonalizedRecommendations);

// GET /api/v1/ai/similar/:productId - Get similar products
router.get('/similar/:productId', aiController.getSimilarProducts);

// GET /api/v1/ai/trending - Get trending products
router.get('/trending', aiController.getTrendingProducts);

// POST /api/v1/ai/track - Record user interaction (requires auth)
router.post('/track', authenticate, aiController.recordInteraction);

// POST /api/v1/ai/search-suggestions - Get search suggestions
router.post('/search-suggestions', aiController.getSearchSuggestions);

export default router;