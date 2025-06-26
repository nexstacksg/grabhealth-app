'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import Image from 'next/image';
import services from '@/services';
import { IProduct } from '@app/shared-types';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);

        // Directly fetch products without AI recommendations for now
        const regularProducts = await services.product.searchProducts({
          limit: 4,
          page: 1,
        });
        setProducts(regularProducts.products || []);
        setError(null);
      } catch (err) {
        setError('Error loading products. Please try again later.');
        console.error('Failed to load products:', err);
        setProducts([]); // Set empty array to prevent undefined errors
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: IProduct }) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  // Ensure product has valid data
  if (!product || !product.id || !product.name) {
    return null;
  }

  const regularPrice = product.price || 0;
  // For AI recommendations, we'll use the regular price (no discounts for now)
  const discountedPrice = regularPrice;
  const discount = 0; // No discount calculation for AI recommendations

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      await addToCart(
        {
          id: product.id,
          name: product.name,
          price: discountedPrice,
          image_url: product.imageUrl || '',
        },
        1
      );

      // Track user interaction for AI recommendations
      try {
        await services.ai.recordInteraction({
          type: 'click',
          productId: product.id.toString(),
          categoryId: product.categoryId?.toString(),
          metadata: {
            source: 'featured_products',
            price: discountedPrice,
            action: 'add_to_cart',
          },
        });
      } catch (trackingError) {
        console.warn('Failed to track interaction:', trackingError);
      }

      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative">
        <Image
          src={product.imageUrl || '/placeholder.svg?height=200&width=200'}
          alt={product.name}
          width={300}
          height={300}
          className="w-full h-48 object-cover"
        />
        {discount > 0 && (
          <Badge className="absolute top-2 right-2 bg-emerald-500">
            {discount}% OFF
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="text-sm text-emerald-600 font-medium mb-1">
          {product.category?.name || 'AI Recommendation'}
        </div>
        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold">
              ${discountedPrice.toFixed(2)}
            </span>
            {discount > 0 && (
              <span className="text-gray-400 line-through ml-2 text-sm">
                ${regularPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <Button
          className="w-full bg-emerald-500 hover:bg-emerald-600"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
}
