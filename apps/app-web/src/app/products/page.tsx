'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/products/useProducts';
import { useCategories } from '@/hooks/products/useCategories';
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
  const {
    products,
    prevProducts,
    loading,
    pageTransitioning,
    pagination,
    fetchProducts,
    filters,
    updateFilters,
  } = useProducts();
  const categories = useCategories();
  const [activeCategory, setActiveCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('');

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
          {activeCategory === 'all' && !filters.query && !filters.inStock && !filters.minPrice && !filters.maxPrice && (
            <AIRecommendationsSection />
          )}
          
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