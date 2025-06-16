import { useState, useEffect } from 'react';
import services from '@/lib/services';
import { IProduct } from '@app/shared-types';

export function useAIRecommendations() {
  const [recommendations, setRecommendations] = useState<IProduct[]>([]);
  const [trending, setTrending] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAIRecommendations() {
      try {
        setLoading(true);
        setError(null);
        const [personalizedRecs, trendingProds] = await Promise.all([
          services.ai.getPersonalizedRecommendations({ limit: 4 }),
          services.ai.getTrendingProducts({ limit: 4 })
        ]);
        setRecommendations(personalizedRecs);
        setTrending(trendingProds);
      } catch (error: any) {
        console.error('Error fetching AI recommendations:', error);
        
        // Provide user-friendly error messages
        if (error.code === 'NETWORK_ERROR') {
          setError('Unable to connect to the server. Please check your internet connection.');
        } else if (error.code === 'INVALID_RESPONSE') {
          setError('Server returned an invalid response. Please try again later.');
        } else if (error.statusCode === 404) {
          setError('AI recommendations service is not available.');
        } else {
          setError('Failed to load recommendations. Please try again later.');
        }
        
        // Set empty arrays on error to prevent UI issues
        setRecommendations([]);
        setTrending([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAIRecommendations();
  }, []);

  return { recommendations, trending, loading, error };
}