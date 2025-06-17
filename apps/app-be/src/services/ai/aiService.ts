import { PrismaClient } from '@prisma/client';
import { IProduct } from '@app/shared-types';
import { AppError } from '../../middleware/error/errorHandler';

interface RecommendationOptions {
  limit?: number;
  category?: string;
}

interface InteractionData {
  productId: number;
  interactionType: 'view' | 'add_to_cart' | 'purchase' | 'share' | 'review';
  metadata?: Record<string, any>;
}

interface SearchSuggestionOptions {
  limit?: number;
}

export class AIService {
  constructor(private prisma: PrismaClient) {}

  async getPersonalizedRecommendations(
    userId?: string,
    options: RecommendationOptions = {}
  ): Promise<IProduct[]> {
    try {
      const { limit = 4, category } = options;

      // For now, implement a simple recommendation algorithm
      // In a real-world scenario, this would use ML models, user behavior data, etc.
      
      let whereClause: any = {
        inStock: true,
        status: 'ACTIVE',
      };

      if (category) {
        whereClause.category = {
          name: category,
        };
      }

      // If user is authenticated, we could personalize based on their history
      if (userId) {
        // Get user's purchase/interaction history to personalize recommendations
        const userOrders = await this.prisma.order.findMany({
          where: { userId: userId },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          take: 10,
        });

        // Extract category preferences from user's order history
        const userCategories = userOrders.flatMap(order =>
          order.items
            .filter(item => item.product?.categoryId)
            .map(item => item.product!.categoryId)
        );

        if (userCategories.length > 0) {
          // Prefer products from categories the user has purchased from
          whereClause.categoryId = {
            in: Array.from(new Set(userCategories)),
          };
        }
      }

      const products = await this.prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
        },
        orderBy: [
          { createdAt: 'desc' }, // Newer products first
          { id: 'desc' }
        ],
        take: limit,
      });

      return products as IProduct[];
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      throw new AppError('Failed to get personalized recommendations', 500);
    }
  }

  async getSimilarProducts(
    productId: number,
    options: RecommendationOptions = {}
  ): Promise<IProduct[]> {
    try {
      const { limit = 4 } = options;

      // Find the source product
      const sourceProduct = await this.prisma.product.findUnique({
        where: { id: productId },
        include: { category: true },
      });

      if (!sourceProduct) {
        throw new AppError('Product not found', 404);
      }

      // Find similar products based on category and price range
      const priceRange = sourceProduct.price * 0.5; // 50% price range
      const minPrice = Math.max(0, sourceProduct.price - priceRange);
      const maxPrice = sourceProduct.price + priceRange;

      const similarProducts = await this.prisma.product.findMany({
        where: {
          id: { not: productId }, // Exclude the source product
          inStock: true,
          status: 'ACTIVE',
          OR: [
            {
              categoryId: sourceProduct.categoryId,
            },
            {
              price: {
                gte: minPrice,
                lte: maxPrice,
              },
            },
          ],
        },
        include: {
          category: true,
        },
        orderBy: [
          // Prioritize same category
          { categoryId: sourceProduct.categoryId ? 'asc' : 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
      });

      return similarProducts as IProduct[];
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error getting similar products:', error);
      throw new AppError('Failed to get similar products', 500);
    }
  }

  async getTrendingProducts(
    options: RecommendationOptions = {}
  ): Promise<IProduct[]> {
    try {
      const { limit = 4 } = options;

      // Calculate trending products based on recent order activity
      // Get products with most orders in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const trendingProductIds = await this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            createdAt: {
              gte: thirtyDaysAgo,
            },
          },
        },
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: limit * 2, // Get more to filter out inactive/out-of-stock
      });

      const productIds = trendingProductIds.map(item => item.productId);

      if (productIds.length === 0) {
        // Fallback to newest products if no orders found
        const fallbackProducts = await this.prisma.product.findMany({
          where: {
            inStock: true,
            status: 'ACTIVE',
          },
          include: {
            category: true,
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        });
        return fallbackProducts as IProduct[];
      }

      const trendingProducts = await this.prisma.product.findMany({
        where: {
          id: { in: productIds },
          inStock: true,
          status: 'ACTIVE',
        },
        include: {
          category: true,
        },
        take: limit,
      });

      // Sort by the original trending order
      const sortedProducts = productIds
        .map(id => trendingProducts.find(p => p.id === id))
        .filter(Boolean)
        .slice(0, limit);

      return sortedProducts as IProduct[];
    } catch (error) {
      console.error('Error getting trending products:', error);
      throw new AppError('Failed to get trending products', 500);
    }
  }

  async recordInteraction(
    userId: string | undefined,
    data: InteractionData
  ): Promise<void> {
    try {
      // For now, we'll store interactions in a simple format
      // In a real AI system, this would feed into recommendation models
      
      if (!userId) {
        // For anonymous users, we could still track for general trends
        // but for now, we'll just skip recording
        return;
      }

      // Verify the product exists
      const product = await this.prisma.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      // Store the interaction (this would be in a separate interactions table in a real system)
      // For now, we'll create a simple log entry
      console.log('AI Interaction recorded:', {
        userId,
        productId: data.productId,
        interactionType: data.interactionType,
        metadata: data.metadata,
        timestamp: new Date(),
      });

      // In the future, this could:
      // 1. Store in an interactions table
      // 2. Update user preference scores
      // 3. Feed into ML model training data
      // 4. Update product popularity scores
      
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error recording interaction:', error);
      throw new AppError('Failed to record interaction', 500);
    }
  }

  async getSearchSuggestions(
    query: string,
    options: SearchSuggestionOptions = {}
  ): Promise<string[]> {
    try {
      const { limit = 5 } = options;

      // Simple keyword-based search suggestions
      // In a real AI system, this would use NLP and search analytics
      
      const products = await this.prisma.product.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
              },
            },
            {
              description: {
                contains: query,
              },
            },
          ],
          inStock: true,
          status: 'ACTIVE',
        },
        select: {
          name: true,
        },
        take: limit,
      });

      // Extract unique suggestions from product names
      const suggestions = products
        .map(p => p.name)
        .filter(name => name.toLowerCase().includes(query.toLowerCase()));

      // Add some common health-related search suggestions
      const commonSuggestions = [
        'pain relief',
        'vitamins',
        'supplements',
        'cold medicine',
        'first aid',
        'health products',
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase()) &&
        !suggestions.includes(suggestion)
      );

      return [...suggestions, ...commonSuggestions].slice(0, limit);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      throw new AppError('Failed to get search suggestions', 500);
    }
  }
}