'use client';

import { useState, useEffect, useCallback } from 'react';
import { productService, categoryService, PriceRange } from '@/services';
import { ICategory, IProduct, ProductSearchParams } from '@app/shared-types';
import { ProductFilters } from '@/components/features/products/ProductFilters';
import { ProductGrid } from '@/components/features/products/ProductGrid';
import { Pagination } from '@/components/features/products/Pagination';
import { AIRecommendationsSection } from '@/components/features/products/AIRecommendationsSection';
import { ProductPageTransition } from '@/components/features/products/ProductSkeleton';

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
  const [priceRange, setPriceRange] = useState<PriceRange | ''>('');

  // Fetch products function using enhanced service
  const fetchProducts = useCallback(
    async (
      page = 1,
      category?: string,
      priceRangeParam?: PriceRange | string
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
        // Use enhanced service method with business logic
        const response = await productService.searchProductsWithFilters({
          page,
          limit: pagination.limit,
          category: category && category !== 'all' ? category : undefined,
          priceRange:
            priceRangeParam && priceRangeParam !== ''
              ? (priceRangeParam as PriceRange)
              : undefined,
          query: filters.query,
          inStock: filters.inStock,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
        });

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
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
        });
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
        setPageTransitioning(false);
      }
    },
    [
      pagination.limit,
      pagination.page,
      products.length,
      filters.query,
      filters.inStock,
      filters.minPrice,
      filters.maxPrice,
    ]
  );

  // Update filters and refetch products using service business logic
  const updateFilters = useCallback(
    (newFilters: Partial<ProductSearchParams>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);

      // Use service method to determine price range from min/max values
      const priceRange = services.product.getPriceRangeFromValues(
        newFilters.minPrice,
        newFilters.maxPrice
      );

      fetchProducts(1, updatedFilters.category, priceRange);
    },
    [filters, fetchProducts]
  );

  // Load categories using the shared service
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Fetch categories using the service from lib/services
        const fetchedCategories = await categoryService.getCategories();

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
    setPriceRange(range as PriceRange | '');
    // Convert range to min/max and update filters
    if (range === 'under25') {
      updateFilters({ minPrice: 0, maxPrice: 25 });
    } else if (range === '25to50') {
      updateFilters({ minPrice: 25, maxPrice: 50 });
    } else if (range === '50to100') {
      updateFilters({ minPrice: 50, maxPrice: 100 });
    } else if (range === 'over100') {
      updateFilters({ minPrice: 100, maxPrice: undefined });
    } else {
      updateFilters({ minPrice: undefined, maxPrice: undefined });
    }
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
