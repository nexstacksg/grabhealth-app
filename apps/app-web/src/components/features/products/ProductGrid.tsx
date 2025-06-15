import React from 'react';
import { ProductCard } from './ProductCard';
import { IProduct } from '@app/shared-types';

interface ProductGridProps {
  products: IProduct[];
}

export const ProductGrid = React.memo(({ products }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
});
