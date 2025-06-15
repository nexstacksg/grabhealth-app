import { useState, useEffect } from 'react';
import { aiService } from '@/services/ai.service';
import { IProduct } from '@app/shared-types';

export function useAIRecommendations() {
  const [recommendations, setRecommendations] = useState<IProduct[]>([]);
  const [trending, setTrending] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAIRecommendations() {
      try {
        setLoading(true);
        const [personalizedRecs, trendingProds] = await Promise.all([
          aiService.getPersonalizedRecommendations({ limit: 4 }),
          aiService.getTrendingProducts({ limit: 4 })
        ]);
        setRecommendations(personalizedRecs);
        setTrending(trendingProds);
      } catch (error) {
        console.error('Error fetching AI recommendations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAIRecommendations();
  }, []);

  return { recommendations, trending, loading };
}