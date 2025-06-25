import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { formatPrice } from '@/lib/utils';
import { IProduct } from '@app/shared-types';

interface ProductCardProps {
  product: IProduct;
}

export const ProductCard = React.memo(({ product }: ProductCardProps) => {
  // Use documentId for Strapi v5, fallback to id
  const productId = (product as any).documentId || product.id;
  
  return (
    <Link href={`/products/${productId}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="relative">
          <Image
            src={product.imageUrl || '/placeholder.svg?height=200&width=200'}
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
          <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between mb-3">
            <div>
              {product.price ? (
                <span className="text-lg font-bold">
                  {formatPrice(product.price)}
                </span>
              ) : (
                <span className="text-sm text-gray-500">
                  Contact for pricing
                </span>
              )}
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
  );
});
