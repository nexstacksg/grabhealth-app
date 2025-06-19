'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Star, ChevronLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice } from '@/lib/utils';
import services from '@/services';
import { IProduct } from '@app/shared-types';

interface ProductWithExtras extends IProduct {
  features?: string[];
  usage?: string;
  ingredients?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<ProductWithExtras | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productId = Number(params.id);

        if (isNaN(productId)) {
          throw new Error('Invalid product ID');
        }

        const productData = await services.product.getProduct(productId);

        // Add demo data for features, usage, and ingredients
        const enhancedProduct = addDemoData(productData);
        setProduct(enhancedProduct);

        // Track product view for AI recommendations
        try {
          await services.ai.recordInteraction({
            userId: undefined, // Will be handled by the service if user is authenticated
            productId: productData.id,
            interactionType: 'view',
            metadata: {
              source: 'product_detail',
              category: productData.categoryId,
            },
          });
        } catch (trackingError) {
          console.warn('Failed to track product view:', trackingError);
        }

        // Fetch AI-powered similar products
        try {
          const similarProducts = await services.ai.getSimilarProducts(
            productData.id,
            { limit: 4 }
          );
          setRelatedProducts(similarProducts);
        } catch (err) {
          console.error('Error fetching similar products:', err);
          // Fallback to category-based products if AI fails
          if (productData.categoryId) {
            try {
              const categoryProducts =
                await services.product.getProductsByCategory(
                  productData.categoryId.toString(),
                  { limit: 4 }
                );
              setRelatedProducts(
                categoryProducts.products
                  .filter((p: IProduct) => p.id !== productData.id)
                  .slice(0, 4)
              );
            } catch (fallbackErr) {
              console.error(
                'Error fetching category products as fallback:',
                fallbackErr
              );
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  // Add demo data for features, usage, and ingredients
  const addDemoData = (product: IProduct): ProductWithExtras => {
    if (!product) return product as ProductWithExtras;

    const extendedProduct = product as ProductWithExtras;

    // Add demo features if not present
    if (!extendedProduct.features || extendedProduct.features.length === 0) {
      const demoFeatures: Record<string, string[]> = {
        'Pain Relief': [
          'Fast-acting formula provides relief within 30 minutes',
          'Targets multiple types of pain including headaches and muscle aches',
          'Non-drowsy formula allows for daytime use',
          'Gentle on the stomach when taken with food',
        ],
        'Cold & Flu': [
          'Relieves nasal congestion and sinus pressure',
          'Reduces fever and body aches',
          'Suppresses cough for up to 8 hours',
          'Contains Vitamin C to support immune function',
        ],
        Vitamins: [
          'Provides 100% of daily recommended vitamins and minerals',
          'Slow-release formula for all-day nutrient absorption',
          'Supports immune system and energy production',
          'Vegetarian-friendly formula',
        ],
        'First Aid': [
          'Antimicrobial properties help prevent infection',
          'Creates a protective barrier over wounds',
          'Promotes faster healing of minor cuts and burns',
          'Waterproof and long-lasting protection',
        ],
      };

      // Select features based on product category
      const categoryName = product.category?.name || 'General';
      extendedProduct.features = demoFeatures[
        categoryName as keyof typeof demoFeatures
      ] || [
        'Clinically tested for effectiveness and safety',
        'Made with pharmaceutical-grade ingredients',
        'Free from artificial colors and preservatives',
        'Manufactured in FDA-approved facilities',
      ];
    }

    // Add demo usage if not present
    if (!extendedProduct.usage) {
      const demoUsage: Record<string, string> = {
        'Pain Relief':
          'Adults and children 12 years and over: Take 1-2 tablets every 4-6 hours as needed, not exceeding 6 tablets in 24 hours. Take with food or milk if stomach upset occurs. Consult a doctor for use in children under 12 years of age.',
        'Cold & Flu':
          'Adults and children 12 years and over: Take 2 capsules every 6 hours, not exceeding 8 capsules in 24 hours. Do not use for more than 7 days unless directed by a doctor. Not recommended for children under 12 years.',
        Vitamins:
          'Adults: Take one tablet daily with a meal. For best absorption, take with a source of fat. Do not exceed recommended dosage. Store in a cool, dry place away from direct sunlight.',
        'First Aid':
          'Clean the affected area thoroughly with mild soap and water before application. Apply a thin layer to the affected area 1-3 times daily as needed. Cover with a sterile bandage if necessary. Consult a healthcare professional for deep or puncture wounds.',
      };

      const categoryName = product.category?.name || 'General';
      extendedProduct.usage =
        demoUsage[categoryName as keyof typeof demoUsage] ||
        'Take as directed on the package or as advised by your healthcare professional. Store in a cool, dry place away from direct sunlight and out of reach of children. Do not use if safety seal is broken or missing.';
    }

    // Add demo ingredients if not present
    if (!extendedProduct.ingredients) {
      const demoIngredients: Record<string, string> = {
        'Pain Relief':
          'Active Ingredients: Acetaminophen 500mg, Ibuprofen 200mg. Inactive Ingredients: Microcrystalline cellulose, corn starch, sodium starch glycolate, colloidal silicon dioxide, magnesium stearate, hypromellose, polyethylene glycol.',
        'Cold & Flu':
          'Active Ingredients: Acetaminophen 325mg, Dextromethorphan HBr 10mg, Phenylephrine HCl 5mg. Inactive Ingredients: Gelatin, corn starch, silicon dioxide, titanium dioxide, FD&C Blue No. 1, FD&C Red No. 40, vitamin C (ascorbic acid) 60mg.',
        Vitamins:
          'Vitamin A (as retinyl acetate) 5000 IU, Vitamin C (as ascorbic acid) 60mg, Vitamin D (as cholecalciferol) 400 IU, Vitamin E (as dl-alpha tocopheryl acetate) 30 IU, Vitamin K (as phytonadione) 25mcg, Thiamin (as thiamin mononitrate) 1.5mg, Riboflavin 1.7mg, Niacin (as niacinamide) 20mg, Vitamin B6 (as pyridoxine HCl) 2mg, Folate (as folic acid) 400mcg, Vitamin B12 (as cyanocobalamin) 6mcg, Biotin 30mcg, Pantothenic Acid (as d-calcium pantothenate) 10mg, Calcium (as calcium carbonate) 200mg, Iron (as ferrous fumarate) 18mg, Phosphorus (as dicalcium phosphate) 20mg, Iodine (as potassium iodide) 150mcg, Magnesium (as magnesium oxide) 100mg, Zinc (as zinc oxide) 15mg, Selenium (as sodium selenate) 20mcg, Copper (as copper sulfate) 2mg, Manganese (as manganese sulfate) 2mg, Chromium (as chromium picolinate) 120mcg, Molybdenum (as sodium molybdate) 75mcg, Chloride (as potassium chloride) 72mg, Potassium (as potassium chloride) 80mg, Boron (as sodium borate) 150mcg, Nickel (as nickel sulfate) 5mcg, Silicon (as silicon dioxide) 2mg, Tin (as stannous chloride) 10mcg, Vanadium (as sodium metavanadate) 10mcg.',
        'First Aid':
          'Active Ingredient: Benzalkonium Chloride 0.13%. Inactive Ingredients: Purified water, glycerin, hydroxypropyl methylcellulose, propylene glycol, aloe vera extract, lavender oil, tea tree oil, vitamin E acetate.',
      };

      const categoryName = product.category?.name || 'General';
      extendedProduct.ingredients =
        demoIngredients[categoryName as keyof typeof demoIngredients] ||
        'Active and inactive ingredients listed on packaging. Please refer to the product label for complete ingredient information. Contains no artificial colors, flavors, or preservatives unless otherwise stated.';
    }

    return extendedProduct;
  };

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
    <div className="container max-w-6xl py-6 md:py-10 px-4 md:px-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/products"
          className="text-sm text-gray-500 hover:text-emerald-600 flex items-center group transition-all duration-200"
        >
          <div className="bg-gray-100 rounded-full p-1 mr-2 group-hover:bg-emerald-100 transition-all duration-200">
            <ChevronLeft className="h-4 w-4 text-gray-600 group-hover:text-emerald-600" />
          </div>
          <span>Back to Products</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 mb-10 md:mb-16">
        {/* Product Image Section */}
        <div className="relative rounded-xl overflow-hidden bg-white border border-gray-100 h-[350px] md:h-[450px] group">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Image
            src={product.imageUrl || '/placeholder.svg?height=400&width=400'}
            alt={product.name}
            fill
            className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
            priority
          />

          {/* Category Badge */}
          {product.category && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-gray-100">
              {product.category.name}
            </div>
          )}

          {/* Status Badge */}
          {product.inStock ? (
            <Badge className="absolute top-4 right-4 bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 px-3">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-white mr-1.5 animate-pulse"></div>
                In Stock
              </div>
            </Badge>
          ) : (
            <Badge className="absolute top-4 right-4 bg-gray-500 hover:bg-gray-600 transition-all duration-200 px-3">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6 mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-800">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < 4 ? 'text-yellow-500' : 'text-gray-300'}`}
                    fill="currentColor"
                  />
                ))}
                <span className="text-gray-700 ml-2 text-sm font-medium">
                  4.0
                </span>
              </div>
              <span className="text-gray-500 text-sm">(24 reviews)</span>
              <span className="hidden md:inline mx-3 text-gray-300">|</span>
              <span className="text-gray-500 text-sm flex items-center">
                <ShoppingBag className="h-4 w-4 mr-1 text-emerald-500" />
                142 sold this month
              </span>
            </div>

            <div className="mb-4 md:mb-6 bg-gray-50 p-3 md:p-4 rounded-lg">
              <div className="flex flex-wrap items-baseline gap-3 mb-2">
                <span className="text-2xl md:text-3xl font-bold text-emerald-600">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>

            <div className="mb-4 md:mb-6 border-b border-gray-100 pb-4 md:pb-6">
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex space-x-4">
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image_url: product.imageUrl || undefined,
                }}
                disabled={!product.inStock}
                className="w-full py-3 text-base font-medium transition-all duration-200"
                size="lg"
              />
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <Tabs defaultValue="features" className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-gray-50 p-0 h-auto">
                <TabsTrigger
                  value="features"
                  className="py-3 text-sm md:text-base data-[state=active]:bg-white"
                >
                  Features
                </TabsTrigger>
                <TabsTrigger
                  value="usage"
                  className="py-3 text-sm md:text-base data-[state=active]:bg-white"
                >
                  Usage
                </TabsTrigger>
                <TabsTrigger
                  value="ingredients"
                  className="py-3 text-sm md:text-base data-[state=active]:bg-white"
                >
                  Ingredients
                </TabsTrigger>
              </TabsList>

              <TabsContent value="features" className="p-4 md:p-6">
                <ul className="space-y-2 md:space-y-3">
                  {product.features?.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start text-sm md:text-base"
                    >
                      <div className="bg-emerald-50 border border-emerald-100 rounded-full p-1 mr-2 md:mr-3 mt-0.5 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-emerald-600"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  )) || (
                    <p className="text-gray-500 italic">
                      No features listed for this product.
                    </p>
                  )}
                </ul>
              </TabsContent>

              <TabsContent value="usage" className="p-4 md:p-6">
                {product.usage ? (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h3 className="text-blue-800 font-medium mb-2 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Recommended Usage
                    </h3>
                    <p className="text-gray-700">{product.usage}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No usage information available for this product.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="ingredients" className="p-4 md:p-6">
                {product.ingredients ? (
                  <div>
                    <p className="text-gray-700 mb-4">{product.ingredients}</p>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                      <p className="text-sm text-yellow-800">
                        <span className="font-medium">Note:</span> If you have
                        allergies or specific health concerns, please consult
                        with a healthcare professional before use.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No ingredients information available for this product.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* AI-Powered Similar Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link
                href={`/products/${relatedProduct.id}`}
                key={relatedProduct.id}
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
