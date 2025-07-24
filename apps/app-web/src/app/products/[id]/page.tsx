'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import { ProductVariantSelector } from '@/components/products/ProductVariantSelector';

import { formatPrice } from '@/lib/utils';
import services from '@/services';
import type { IProduct, IProductVariant } from '@app/shared-types';

type ProductId = {
  id?: string;
};

interface ProductWithExtras extends IProduct, ProductId {
  features?: string[];
  usage?: string;
  ingredients?: string;
  variants?: IProductVariant[]; // Explicitly include variants
}

// Component to format product descriptions beautifully
function ProductDescription({
  description,
  productName,
}: {
  description: string;
  productName?: string;
}) {
  if (!description) return null;

  // Check if this is a travel package
  const isTravelPackage =
    productName?.toLowerCase().includes('travel') ||
    description.toLowerCase().includes('travel') ||
    description.toLowerCase().includes('package includes') ||
    description.toLowerCase().includes('destinations');

  // Extract key information from description in a compact way
  const extractKeyInfo = (desc: string) => {
    const sections = desc.split('\n\n').filter((section) => section.trim());

    let mainDescription = '';
    let keyBenefits: string[] = [];
    let usage = '';
    let targetAudience: string[] = [];

    sections.forEach((section) => {
      const trimmed = section.trim();

      if (trimmed.includes('Key Benefits') && trimmed.includes('•')) {
        keyBenefits = trimmed
          .split('•')
          .filter((item) => item.trim())
          .slice(0, 3);
      } else if (
        !isTravelPackage &&
        (trimmed.includes('Direction for use') ||
          trimmed.includes('Dosage') ||
          trimmed.includes('Package'))
      ) {
        // Only show usage for non-travel products
        usage = trimmed
          .replace(/Direction for use:|Dosage:|Package:/g, '')
          .trim()
          .substring(0, 150);
      } else if (
        trimmed.includes('Who Should Use') ||
        trimmed.includes('Perfect for')
      ) {
        if (trimmed.includes('•')) {
          targetAudience = trimmed
            .split('•')
            .filter((item) => item.trim())
            .slice(0, 3);
        }
      } else if (
        !trimmed.includes('•') &&
        !trimmed.includes(':') &&
        trimmed.length > 50 &&
        !mainDescription
      ) {
        mainDescription =
          trimmed.substring(0, 180) + (trimmed.length > 180 ? '...' : '');
      }
    });

    return { mainDescription, keyBenefits, usage, targetAudience };
  };

  const { mainDescription, keyBenefits, usage, targetAudience } =
    extractKeyInfo(description);

  return (
    <div className="space-y-3">
      {/* Main Description */}
      {mainDescription && (
        <p className="text-gray-700 leading-relaxed text-base">
          {mainDescription}
        </p>
      )}

      {/* Compact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Key Benefits */}
        {keyBenefits.length > 0 && (
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
            <h4 className="font-semibold text-emerald-800 mb-3 text-base flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Key Benefits
            </h4>
            <ul className="space-y-2 text-sm text-emerald-700">
              {keyBenefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="leading-relaxed">
                    {benefit.trim().substring(0, 80)}
                    {benefit.trim().length > 80 ? '...' : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Target Audience */}
        {targetAudience.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h4 className="font-semibold text-blue-800 mb-3 text-base flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              Perfect For
            </h4>
            <ul className="space-y-2 text-sm text-blue-700">
              {targetAudience.map((audience, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="leading-relaxed">
                    {audience.trim().substring(0, 80)}
                    {audience.trim().length > 80 ? '...' : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Usage Info */}
      {usage && (
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
          <h4 className="font-semibold text-amber-800 mb-2 text-base">
            {isTravelPackage ? 'Package Details' : 'Usage & Dosage'}
          </h4>
          <p className="text-sm text-amber-700 leading-relaxed">{usage}</p>
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<ProductWithExtras | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] =
    useState<IProductVariant | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productId = params?.id as string;
        if (!productId) return;

        const productData = await services.product.getProduct(productId);

        // Always add single bottle option using product price
        if (productData.variants && productData.variants.length > 0) {
          // Check if single bottle variant already exists
          const hasSingleBottle = productData.variants.some(
            (v: IProductVariant) => v.unitQuantity === 1
          );

          if (!hasSingleBottle) {
            // Add single bottle at the beginning using product table price
            productData.variants.unshift({
              documentId: `${productData.documentId}-single-bottle`,
              name: 'Single Bottle',
              sku: `${productData.sku}-1`,
              price: productData.price, // Use price from product table
              unitQuantity: 1,
              unitLabel: 'bottle',
              savingsAmount: null,
              isMostPopular: false,
              stock: productData.qty || 0,
            });
          }
        }

        setProduct(productData as ProductWithExtras);

        if (productData.variants && productData.variants.length > 0) {
          const defaultVariant =
            productData.variants.find(
              (v: IProductVariant) => v.isMostPopular
            ) || productData.variants[0];
          setSelectedVariant(defaultVariant);
        }

        if (productData.categoryId) {
          try {
            const categoryProducts =
              await services.product.getProductsByCategory(
                productData.categoryId.toString(),
                { limit: 5 }
              );
            setRelatedProducts(
              categoryProducts.products
                .filter(
                  (p: IProduct) => p.documentId !== productData.documentId
                )
                .slice(0, 4)
            );
          } catch (err) {
            console.error('Error fetching related products:', err);
          }
        }
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchProduct();
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="container max-w-6xl py-20 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
          <p className="text-gray-500">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container max-w-6xl py-20 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            {error ||
              'This product could not be found or may have been removed.'}
          </p>
          <Link href="/products">
            <Button>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-4 md:py-6 px-4 md:px-6">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link
          href="/products"
          className="text-base text-gray-500 hover:text-emerald-600 flex items-center group transition-all duration-200"
        >
          <div className="bg-gray-100 rounded-full p-2 mr-3 group-hover:bg-emerald-100 transition-all duration-200">
            <ChevronLeft className="h-5 w-5 text-gray-600 group-hover:text-emerald-600" />
          </div>
          <span>Back to Products</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Product Image Gallery Section */}
        <div className="relative">
          <ProductImageGallery
            images={
              product.images || (product.imageUrl ? [product.imageUrl] : [])
            }
            productName={product.name}
          />

          {/* Category Badge */}
          {product.category && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-gray-100 z-10">
              {product.category.name}
            </div>
          )}

          {/* Status Badge */}
          {product.inStock ? (
            <Badge className="absolute top-4 right-4 bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 px-3 z-10">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-white mr-1.5 animate-pulse"></div>
                In Stock
              </div>
            </Badge>
          ) : (
            <Badge className="absolute top-4 right-4 bg-gray-500 hover:bg-gray-600 transition-all duration-200 px-3 z-10">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-5 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800 leading-tight">
              {product.name}
            </h1>

            {/* Show product price or variant selector */}
            {product.variants && product.variants.length > 0 ? (
              <div className="mb-6">
                <ProductVariantSelector
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onVariantSelect={setSelectedVariant}
                />
              </div>
            ) : (
              <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                <span className="text-2xl md:text-3xl font-bold text-emerald-600">
                  {formatPrice(product.price)}
                </span>
              </div>
            )}

            <div className="mb-4">
              <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-emerald-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Product Details
                </h2>
                <ProductDescription
                  description={product.description || ''}
                  productName={product.name}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <AddToCartButton
                product={
                  {
                    id: product.documentId,
                    name: selectedVariant
                      ? `${product.name} - ${selectedVariant.name}`
                      : product.name,
                    price: selectedVariant
                      ? selectedVariant.price
                      : product.price,
                    image_url: product.imageUrl || undefined,
                    variantId: selectedVariant?.documentId,
                    variantName: selectedVariant?.name,
                  } as any
                }
                disabled={
                  !product.inStock ||
                  (selectedVariant ? selectedVariant.stock === 0 : false)
                }
                className="w-full py-2.5 text-base font-medium transition-all duration-200"
                size="lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link
                href={`/products/${relatedProduct.documentId}`}
                key={relatedProduct.documentId}
              >
                <Card className="h-full hover:shadow-md transition-shadow overflow-hidden">
                  <div className="aspect-square relative">
                    <Image
                      src={
                        relatedProduct.imageUrl ||
                        '/placeholder.svg?height=200&width=200'
                      }
                      alt={relatedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                      {relatedProduct.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-emerald-600">
                        {formatPrice(relatedProduct.price)}
                      </span>
                      {!relatedProduct.inStock && (
                        <Badge
                          variant="outline"
                          className="text-xs text-gray-500"
                        >
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
