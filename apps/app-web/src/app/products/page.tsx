'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { formatPrice } from '@/lib/utils';
import { productService } from '@/services/product.service';
import { aiService } from '@/services/ai.service';
import { IProduct, ProductSearchParams } from '@app/shared-types';

// Client-side data fetching with pagination
function useProducts() {
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

      const response = await productService.searchProducts(searchParams);

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
  }, [pagination.page, pagination.limit, products, filters.query, filters.inStock]);

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

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

function useCategories() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await productService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }

    fetchCategories();
  }, []);

  return categories;
}

function useAIRecommendations() {
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

// AI Recommendations Component
function AIRecommendationsSection() {
  const { recommendations, trending, loading } = useAIRecommendations();

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0 && trending.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <Tabs defaultValue="personalized" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
          <TabsTrigger value="personalized">Recommended for You</TabsTrigger>
          <TabsTrigger value="trending">Trending Now</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personalized">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id}>
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <div className="relative">
                    <Image
                      src={product.imageUrl || '/placeholder.svg?height=200&width=200'}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    <Badge className="absolute top-2 left-2 bg-blue-500 text-white">
                      AI Pick
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold">
                        {formatPrice(product.price)}
                      </span>
                      {product.inStock ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                    <AddToCartButton
                      product={{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image_url: product.imageUrl || undefined,
                      }}
                      className="w-full"
                      disabled={!product.inStock}
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="trending">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trending.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id}>
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <div className="relative">
                    <Image
                      src={product.imageUrl || '/placeholder.svg?height=200&width=200'}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                      🔥 Trending
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold">
                        {formatPrice(product.price)}
                      </span>
                      {product.inStock ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                    <AddToCartButton
                      product={{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image_url: product.imageUrl || undefined,
                      }}
                      className="w-full"
                      disabled={!product.inStock}
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Pagination component
function Pagination({
  pagination,
  onPageChange,
}: {
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
}) {
  const { page, totalPages } = pagination;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of the middle section
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      // Adjust if we're near the beginning or end
      if (page <= 3) {
        end = Math.min(totalPages - 1, 4);
      } else if (page >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        Previous
      </Button>

      {getPageNumbers().map((pageNum, index) => (
        <Button
          key={index}
          variant={pageNum === page ? 'default' : 'outline'}
          size="sm"
          onClick={() =>
            typeof pageNum === 'number' ? onPageChange(pageNum) : null
          }
          disabled={typeof pageNum !== 'number'}
          className={typeof pageNum !== 'number' ? 'cursor-default' : ''}
        >
          {pageNum}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </Button>
    </div>
  );
}

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
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    availability: true,
  });

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setActiveCategory(value);
    fetchProducts(1, value);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    // Save current scroll position before fetching new products
    const scrollPosition = window.scrollY;

    // Fetch products for the new page
    fetchProducts(newPage, activeCategory);

    // No automatic scrolling to top - maintain user's position
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

  // Toggle section expansion
  const toggleSection = (section: 'categories' | 'price' | 'availability') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filter categories based on search
  const filteredCategories = categories.filter((category: any) =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Display limited categories unless showAll is true
  const displayedCategories = showAllCategories
    ? filteredCategories
    : filteredCategories.slice(0, 5);

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
          <div className="bg-white p-4 rounded-lg border border-gray-200 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Categories</h3>
                <button
                  onClick={() => toggleSection('categories')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedSections.categories ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  )}
                </button>
              </div>

              {expandedSections.categories && (
                <>
                  <div className="mb-2">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                    <div
                      className={`cursor-pointer rounded px-3 py-1.5 text-sm ${activeCategory === 'all' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'}`}
                      onClick={() => handleCategoryChange('all')}
                    >
                      All Products
                    </div>
                    {displayedCategories.map((category: any) => (
                      <div
                        key={category.id}
                        className={`cursor-pointer rounded px-3 py-1.5 text-sm ${activeCategory === category.name ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'}`}
                        onClick={() => handleCategoryChange(category.name)}
                      >
                        {category.name}
                      </div>
                    ))}

                    {filteredCategories.length > 5 && (
                      <button
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-1 w-full text-left px-3 py-1"
                        onClick={() => setShowAllCategories(!showAllCategories)}
                      >
                        {showAllCategories
                          ? 'Show less'
                          : `Show all (${filteredCategories.length})`}
                      </button>
                    )}

                    {filteredCategories.length === 0 && categorySearch && (
                      <div className="text-sm text-gray-500 px-3 py-1.5">
                        No matching categories
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Price Range</h3>
                <button
                  onClick={() => toggleSection('price')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedSections.price ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  )}
                </button>
              </div>

              {expandedSections.price && (
                <div className="space-y-1">
                  <div
                    className={`cursor-pointer rounded px-3 py-1.5 text-sm ${priceRange === 'under25' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'}`}
                    onClick={() => handlePriceRangeChange('under25')}
                  >
                    Under $25
                  </div>
                  <div
                    className={`cursor-pointer rounded px-3 py-1.5 text-sm ${priceRange === '25to50' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'}`}
                    onClick={() => handlePriceRangeChange('25to50')}
                  >
                    $25 - $50
                  </div>
                  <div
                    className={`cursor-pointer rounded px-3 py-1.5 text-sm ${priceRange === '50to100' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'}`}
                    onClick={() => handlePriceRangeChange('50to100')}
                  >
                    $50 - $100
                  </div>
                  <div
                    className={`cursor-pointer rounded px-3 py-1.5 text-sm ${priceRange === 'over100' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'}`}
                    onClick={() => handlePriceRangeChange('over100')}
                  >
                    Over $100
                  </div>
                  {priceRange && (
                    <div
                      className="cursor-pointer rounded px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 flex items-center"
                      onClick={() => {
                        setPriceRange('');
                        updateFilters({
                          minPrice: undefined,
                          maxPrice: undefined,
                        });
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                      Clear
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Availability</h3>
                <button
                  onClick={() => toggleSection('availability')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedSections.availability ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  )}
                </button>
              </div>

              {expandedSections.availability && (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="inStock"
                      className="mr-2"
                      checked={filters.inStock}
                      onChange={(e) =>
                        handleAvailabilityChange('inStock', e.target.checked)
                      }
                    />
                    <label htmlFor="inStock" className="text-sm">
                      In Stock
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-40 transition-opacity duration-300">
                {prevProducts.map((product) => (
                  <div key={product.id} className="relative">
                    <Card className="overflow-hidden transition-all">
                      <div className="relative">
                        <div className="w-full h-48 bg-gray-100"></div>
                      </div>
                      <CardContent className="p-4">
                        <div className="h-6 bg-gray-100 rounded mb-1 w-3/4"></div>
                        <div className="h-4 bg-gray-100 rounded mb-3 w-full"></div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="h-6 bg-gray-100 rounded w-1/4"></div>
                          <div className="h-6 bg-gray-100 rounded w-1/4"></div>
                        </div>
                        <div className="h-10 bg-gray-100 rounded w-full"></div>
                      </CardContent>
                    </Card>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-pulse rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-white bg-opacity-10 pointer-events-none"></div>
            </>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link href={`/products/${product.id}`} key={product.id}>
                    <Card className="overflow-hidden transition-all hover:shadow-md">
                      <div className="relative">
                        <Image
                          src={
                            product.imageUrl ||
                            '/placeholder.svg?height=200&width=200'
                          }
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full h-48 object-cover"
                        />
                        {product.category && (
                          <Badge className="absolute top-2 left-2 bg-gray-100 text-gray-800 hover:bg-gray-200">
                            {product.category.name}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-1">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-lg font-bold">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                          {product.inStock ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200"
                            >
                              In Stock
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-gray-50 text-gray-500 border-gray-200"
                            >
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                        <AddToCartButton
                          product={{
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image_url: product.imageUrl || undefined,
                          }}
                          className="w-full"
                          disabled={!product.inStock}
                        />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
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
