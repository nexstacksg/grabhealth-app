import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ProductSkeletonProps {
  count?: number;
}

export const ProductSkeleton = React.memo(({ count = 6 }: ProductSkeletonProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="relative">
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
  );
});

export const ProductPageTransition = React.memo(({ products }: { products: any[] }) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-40 transition-opacity duration-300">
        {products.map((product) => (
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
  );
});