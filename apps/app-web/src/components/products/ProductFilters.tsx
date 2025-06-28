import React, { useState } from 'react';
import { ProductSearchParams } from '@app/shared-types';

interface ProductFiltersProps {
  categories: any[];
  activeCategory: string;
  priceRange: string;
  filters: ProductSearchParams;
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (range: string) => void;
  onAvailabilityChange?: (filter: 'inStock', checked: boolean) => void; // Made optional since availability filter is hidden
  onPriceReset: () => void;
}

const ProductFiltersComponent = ({
  categories,
  activeCategory,
  // priceRange, // Commented out - used in commented price filter
  // filters, // Commented out - used in commented availability filter
  onCategoryChange,
  // onPriceRangeChange, // Commented out - used in commented price filter
  // onAvailabilityChange, // Commented out - used in commented availability filter
  // onPriceReset, // Commented out - used in commented price filter
}: ProductFiltersProps) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    availability: true,
  });

  // Filter categories based on search and exclude Personal Care
  const filteredCategories = categories.filter(
    (category: any) =>
      category.name.toLowerCase().includes(categorySearch.toLowerCase()) &&
      category.name !== 'Personal Care' &&
      category.slug !== 'personal-care'
  );

  // Display limited categories unless showAll is true
  const displayedCategories = showAllCategories
    ? filteredCategories
    : filteredCategories.slice(0, 5);

  // Toggle section expansion
  const toggleSection = (section: 'categories' | 'price' | 'availability') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const ChevronUp = () => (
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
  );

  const ChevronDown = () => (
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
  );

  // CloseIcon - commented out, used in price filter
  // const CloseIcon = () => (
  //   <svg
  //     xmlns="http://www.w3.org/2000/svg"
  //     width="12"
  //     height="12"
  //     viewBox="0 0 24 24"
  //     fill="none"
  //     stroke="currentColor"
  //     strokeWidth="2"
  //     strokeLinecap="round"
  //     strokeLinejoin="round"
  //     className="mr-1"
  //   >
  //     <path d="M18 6L6 18M6 6l12 12" />
  //   </svg>
  // );

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 sticky top-4">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Categories</h3>
          <button
            onClick={() => toggleSection('categories')}
            className="text-gray-500 hover:text-gray-700"
          >
            {expandedSections.categories ? <ChevronUp /> : <ChevronDown />}
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
              {displayedCategories.map((category: any) => (
                <div
                  key={category.id}
                  className={`cursor-pointer rounded px-3 py-1.5 text-sm ${activeCategory === category.slug || (category.slug === 'all' && activeCategory === 'all') ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'}`}
                  onClick={() => onCategoryChange(category.slug)}
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

      {/* Price Range Filter - Commented out for future use */}
      {/* <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Price Range</h3>
            <button
              onClick={() => toggleSection('price')}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedSections.price ? <ChevronUp /> : <ChevronDown />}
            </button>
          </div>

          {expandedSections.price && (
            <div className="space-y-1">
              <div
                className={`cursor-pointer rounded px-3 py-1.5 text-sm ${priceRange === 'under25' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'}`}
                onClick={() => onPriceRangeChange('under25')}
              >
                Under $25
              </div>
              <div
                className={`cursor-pointer rounded px-3 py-1.5 text-sm ${priceRange === '25to50' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'}`}
                onClick={() => onPriceRangeChange('25to50')}
              >
                $25 - $50
              </div>
              <div
                className={`cursor-pointer rounded px-3 py-1.5 text-sm ${priceRange === '50to100' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'}`}
                onClick={() => onPriceRangeChange('50to100')}
              >
                $50 - $100
              </div>
              <div
                className={`cursor-pointer rounded px-3 py-1.5 text-sm ${priceRange === 'over100' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'}`}
                onClick={() => onPriceRangeChange('over100')}
              >
                Over $100
              </div>
              {priceRange && (
                <div
                  className="cursor-pointer rounded px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 flex items-center"
                  onClick={onPriceReset}
                >
                  <CloseIcon />
                  Clear
                </div>
              )}
            </div>
          )}
        </div> */}

      {/* Availability filter - hidden for now */}
      {/* <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Availability</h3>
            <button
              onClick={() => toggleSection('availability')}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedSections.availability ? <ChevronUp /> : <ChevronDown />}
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
                    onAvailabilityChange('inStock', e.target.checked)
                  }
                />
                <label htmlFor="inStock" className="text-sm">
                  In Stock
                </label>
              </div>
            </div>
          )}
        </div> */}
    </div>
  );
};

ProductFiltersComponent.displayName = 'ProductFilters';

export const ProductFilters = React.memo(ProductFiltersComponent);
