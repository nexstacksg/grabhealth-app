import { useState, useEffect, useCallback } from 'react';
import services from '@/lib/services';
import { IProduct, ProductSearchParams } from '@app/shared-types';

export function useProducts() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [prevProducts, setPrevProducts] = useState<IProduct[]>([]);
  const [loading, setIsLoading] = useState(true);
  const [pageTransitioning, setPageTransitioning] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<ProductSearchParams>({
    category: undefined,
    query: undefined,
    inStock: undefined,
    minPrice: undefined,
    maxPrice: undefined,
  });

  const fetchProducts = useCallback(async (
    page = 1,
    category?: string,
    priceRange?: string
  ) => {
    // For page changes, use a transitioning state instead of full loading
    if (page !== pagination.page && products.length > 0) {
      setPageTransitioning(true);
      // Keep previous products visible during transition
      setPrevProducts(products);
    } else {
      setIsLoading(true);
    }
    try {
      // Build filters for API call
      const searchParams: ProductSearchParams = {
        page,
        limit: pagination.limit,
      };

      // Add category filter
      if (category && category !== 'all') {
        searchParams.category = category;
      }

      // Add price range filter
      if (priceRange) {
        const [min, max] = getPriceRangeValues(priceRange);
        if (min !== null) searchParams.minPrice = min;
        if (max !== null) searchParams.maxPrice = max;
      }

      // Add other filters from state
      if (filters.query) searchParams.query = filters.query;
      if (filters.inStock) searchParams.inStock = filters.inStock;

      const response = await services.product.searchProducts(searchParams);

      // Update state with response
      setProducts(response.products || []);
      setPagination({
        page: response.page || page,
        limit: pagination.limit,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
      });

      // Update filters state
      setFilters({
        category: category && category !== 'all' ? category : undefined,
        query: filters.query,
        inStock: filters.inStock,
        minPrice: searchParams.minPrice,
        maxPrice: searchParams.maxPrice,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
      setPageTransitioning(false);
    }
  }, [pagination.limit, filters.query, filters.inStock]);

  // Helper function to convert price range string to min/max values
  const getPriceRangeValues = (
    range: string
  ): [number | null, number | null] => {
    switch (range) {
      case 'under25':
        return [0, 25];
      case '25to50':
        return [25, 50];
      case '50to100':
        return [50, 100];
      case 'over100':
        return [100, null];
      default:
        return [null, null];
    }
  };

  // Update filters and refetch products
  const updateFilters = (newFilters: Partial<ProductSearchParams>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Determine price range from min/max values
    let priceRange: string | undefined;
    if (
      newFilters.minPrice !== undefined ||
      newFilters.maxPrice !== undefined
    ) {
      if (newFilters.minPrice === 0 && newFilters.maxPrice === 25)
        priceRange = 'under25';
      else if (newFilters.minPrice === 25 && newFilters.maxPrice === 50)
        priceRange = '25to50';
      else if (newFilters.minPrice === 50 && newFilters.maxPrice === 100)
        priceRange = '50to100';
      else if (newFilters.minPrice === 100 && newFilters.maxPrice === undefined)
        priceRange = 'over100';
    }

    fetchProducts(1, updatedFilters.category, priceRange);
  };

  // Initial fetch - only run once on mount
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    products,
    prevProducts,
    loading,
    pageTransitioning,
    pagination,
    fetchProducts,
    setFilters,
    filters,
    updateFilters,
  };
}