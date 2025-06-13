'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';
import Image from 'next/image';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        // Use a consistent approach for fetching that works in both environments
        const response = await fetch('/api/products?featured=true');

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        // The API now returns data in a different structure with products inside a 'products' property
        const productsArray = Array.isArray(data.products) ? data.products : [];
        setProducts(productsArray.slice(0, 4)); // Get first 4 products
        setError(null);
      } catch (err) {
        setError('Error loading products. Please try again later.');
        console.error(err);
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
      {products.map((product: any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const regularPrice = Number.parseFloat(product.price);
  const discountedPrice = product.discounted_price
    ? Number.parseFloat(product.discounted_price)
    : regularPrice;
  const discount = Math.round((1 - discountedPrice / regularPrice) * 100);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      await addToCart(
        {
          id: product.id,
          name: product.name,
          price: discountedPrice,
          image_url: product.image_url,
        },
        1
      );
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
          src={product.image_url || '/placeholder.svg?height=200&width=200'}
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
          {product.category_name}
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
