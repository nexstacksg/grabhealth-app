'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { productService, categoryService, PriceRange } from '@/services';
import { ICategory, IProduct, ProductSearchParams } from '@app/shared-types';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Pagination } from '@/components/products/Pagination';

import { ProductPageTransition } from '@/components/products/ProductSkeleton';

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

  console.log(products);

  // Categories state
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<PriceRange | ''>('');

  // Fetch products function using enhanced service
  const fetchProducts = useCallback(
    async (page = 1, category?: string) => {
      // For page changes, use a transitioning state instead of full loading
      if (page !== pagination.page) {
        setPageTransitioning(true);
        // Keep previous products visible during transition
        setPrevProducts(products);
      } else {
        setLoading(true);
      }

      try {
        // Simplified search parameters - use the basic searchProducts method
        const searchParams: ProductSearchParams = {
          page,
          limit: pagination.limit,
          category: category && category !== 'all' ? category : undefined,
          query: filters.query,
          inStock: filters.inStock,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
        };

        // Use the basic searchProducts method that we know works
        const response = await productService.searchProducts(searchParams);
        console.log(response);

        // Update state with response
        setProducts(response.products || []);
        setPagination({
          page: response.page || page,
          limit: pagination.limit,
          total: response.total || 0,
          totalPages: response.totalPages || 0,
        });

        // Update filters state
        setFilters((prev) => ({
          ...prev,
          category: category && category !== 'all' ? category : undefined,
        }));
      } catch (error) {
        console.error('❌ Error fetching products:', error);
        setProducts([]);
        setPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
      } finally {
        setLoading(false);
        setPageTransitioning(false);
      }
    },
    [pagination.limit]
  );

  // Update filters and refetch products
  const updateFilters = useCallback(
    (newFilters: Partial<ProductSearchParams>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);

      // Fetch products with updated filters
      fetchProducts(1, updatedFilters.category);
    },
    [filters, fetchProducts]
  );

  // Load categories using the shared service
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Fetch categories using the service from lib/services
        const fetchedCategories = await categoryService.getCategories();

        // Filter out Personal Care category if it exists
        const filteredCategories = fetchedCategories.filter(
          (category) =>
            category.name !== 'Personal Care' &&
            category.slug !== 'personal-care'
        );

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

        setCategories([allCategory, ...filteredCategories]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setActiveCategory(value);
    fetchProducts(1, value);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    fetchProducts(newPage, activeCategory);
  };

  // Handle price range change - simplified
  const handlePriceRangeChange = (range: string) => {
    setPriceRange(range as PriceRange | '');
    // For now, just refetch without price filtering since our products don't have prices
    fetchProducts(1, activeCategory);
  };

  // Handle availability filter changes
  const handleAvailabilityChange = (filter: 'inStock', checked: boolean) => {
    updateFilters({ [filter]: checked || undefined });
  };

  // Handle price reset
  const handlePriceReset = () => {
    setPriceRange('');
    fetchProducts(1, activeCategory);
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
