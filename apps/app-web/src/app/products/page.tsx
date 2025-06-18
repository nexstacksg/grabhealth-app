'use client';

import { useState, useEffect, useCallback } from 'react';
import services from '@/lib/services';
import { ICategory, IProduct, ProductSearchParams } from '@app/shared-types';
import { ProductFilters } from '@/components/features/products/ProductFilters';
import { ProductGrid } from '@/components/features/products/ProductGrid';
import { Pagination } from '@/components/features/products/Pagination';
import { AIRecommendationsSection } from '@/components/features/products/AIRecommendationsSection';
import { ProductPageTransition } from '@/components/features/products/ProductSkeleton';

// Helper function to convert price range string to min/max values
const getPriceRangeValues = (range: string): [number | null, number | null] => {
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

export default function ProductsPage() {
  // Products state
  const [products, setProducts] = useState<IProduct[]>([]);
  const [prevProducts, setPrevProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Categories state
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('');

  // Fetch products function
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
      setLoading(true);
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
      setLoading(false);
      setPageTransitioning(false);
    }
  }, [pagination.limit, pagination.page, products.length, filters.query, filters.inStock]);

  // Update filters and refetch products
  const updateFilters = useCallback((newFilters: Partial<ProductSearchParams>) => {
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
  }, [filters, fetchProducts]);

  // Load categories using the shared service
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Fetch categories using the service from lib/services
        const fetchedCategories = await services.category.getCategories();

        // Add "All" category at the beginning
        const allCategory: ICategory = {
          id: 0,
          name: 'All Products',
          slug: 'all',
          description: 'Browse all products',
          isActive: true,
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setCategories([allCategory, ...fetchedCategories]);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Set default categories on error
        setCategories([
          {
            id: 0,
            name: 'All Products',
            slug: 'all',
            description: 'Browse all products',
            isActive: true,
            sortOrder: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }
    };

    loadCategories();
  }, []);

  // Initial fetch of products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setActiveCategory(value);
    fetchProducts(1, value);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    // Fetch products for the new page
    fetchProducts(newPage, activeCategory);
  };

  // Handle price range change
  const handlePriceRangeChange = (range: string) => {
    setPriceRange(range);
    const [min, max] = getPriceRangeValues(range);
    updateFilters({
      minPrice: min || undefined,
      maxPrice: max || undefined,
    });
  };

  // Handle availability filter changes
  const handleAvailabilityChange = (filter: 'inStock', checked: boolean) => {
    updateFilters({ [filter]: checked || undefined });
  };

  // Handle price reset
  const handlePriceReset = () => {
    setPriceRange('');
    updateFilters({
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Health Products</h1>
        <p className="text-gray-600 mt-1">
          Browse our selection of premium health and wellness products
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <ProductFilters
            categories={categories}
            activeCategory={activeCategory}
            priceRange={priceRange}
            filters={filters}
            onCategoryChange={handleCategoryChange}
            onPriceRangeChange={handlePriceRangeChange}
            onAvailabilityChange={handleAvailabilityChange}
            onPriceReset={handlePriceReset}
          />
        </div>

        {/* Products display */}
        <div className="flex-1">
          {/* AI Recommendations Section - only show when no active filters */}
          {activeCategory === 'all' &&
            !filters.query &&
            !filters.inStock &&
            !filters.minPrice &&
            !filters.maxPrice && <AIRecommendationsSection />}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : pageTransitioning ? (
            <ProductPageTransition products={prevProducts} />
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found.</p>
            </div>
          ) : (
            <>
              <ProductGrid products={products} />
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
