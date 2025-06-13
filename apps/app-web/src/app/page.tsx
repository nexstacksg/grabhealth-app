import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ArrowRight, Truck, CreditCard, Star } from 'lucide-react';
import ProductCategories from '@/components/product-categories';
import Testimonials from '@/components/testimonials';
import PromotionBanner from '@/components/promotion-banner';
import FeaturedProducts from '@/components/featured-products';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#e6f7fa] to-[#c5edf3] py-10 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div>
              <Badge className="mb-4 bg-[#c5edf3] text-[#0C99B4] hover:bg-[#9adde9]">
                Health First
              </Badge>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-3 md:mb-4">
                Your Trusted
                <br />
                Health Partner
              </h1>
              <div className="w-20 md:w-24 h-1 bg-[#0C99B4] mb-4 md:mb-6"></div>
              <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">
                Join our membership program for exclusive health benefits,
                discounts on products, lab services, and monthly free gifts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Link href="/products" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="bg-[#0C99B4] hover:bg-[#0a7b91] w-full sm:w-auto"
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#0C99B4] text-[#0C99B4] hover:bg-[#e6f7fa] w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative h-[300px] md:h-[400px] w-full mt-4 md:mt-0">
              <div className="absolute inset-0 bg-[#c5edf3] rounded-lg -rotate-3"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/Frame46.png"
                  alt="Health Assistant"
                  width={400}
                  height={400}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-[#0C99B4] rounded-full mr-2"></div>
                  <span className="text-sm font-medium">Secure Platform</span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">For Members</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#c5edf3] flex items-center justify-center mr-4">
                    <Truck className="h-5 w-5 text-[#0C99B4]" />
                  </div>
                  <h3 className="text-xl font-semibold">Fast Delivery</h3>
                </div>
                <p className="text-gray-600">
                  Reliable priority service for members
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#c5edf3] flex items-center justify-center mr-4">
                    <Star className="h-5 w-5 text-[#0C99B4]" />
                  </div>
                  <h3 className="text-xl font-semibold">Verified Sellers</h3>
                </div>
                <p className="text-gray-600">Trusted quality and safety</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#c5edf3] flex items-center justify-center mr-4">
                    <CreditCard className="h-5 w-5 text-[#0C99B4]" />
                  </div>
                  <h3 className="text-xl font-semibold">Secure Payments</h3>
                </div>
                <p className="text-gray-600">Safe and easy checkout</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-10 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most popular health products with exclusive member
              discounts.
            </p>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      {/* Service Values */}
      <section className="py-10 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="grid grid-cols-2 gap-2 md:gap-4 mb-6 md:mb-0">
              <div className="aspect-square rounded-lg overflow-hidden">
                <Image
                  src="/pills-capsules-stethoscope-white-table-concept-healthcare.png"
                  alt="Health Product"
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="aspect-square rounded-lg overflow-hidden">
                <Image
                  src="/pills-with-glass-jar.png"
                  alt="Health Product"
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="aspect-square rounded-lg overflow-hidden">
                <Image
                  src="/portrait-young-asian-male-doctor-blue-background.png"
                  alt="Health Product"
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="aspect-square rounded-lg overflow-hidden">
                <Image
                  src="/vitamins-supplements-healthy-life-concept.png"
                  alt="Health Product"
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
                Our Service Values
              </h2>
              <div className="w-14 md:w-16 h-1 bg-[#0C99B4] mb-4 md:mb-6"></div>
              <p className="text-sm md:text-base text-gray-600 mb-5 md:mb-6">
                The cornerstone of our establishment is making the benefits of
                exceptional medical services reach the public without
                discrimination. We strive to live up to this philosophy through
                our stellar values, that are the pillar of every service that we
                offer under the banner of our prestigious platform.
              </p>
              <Button className="bg-[#0C99B4] hover:bg-[#0a7b91] w-full sm:w-auto">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <ProductCategories />

      {/* Testimonials */}
      <Testimonials />

      {/* Promotion Banner */}
      <PromotionBanner />
    </div>
  );
}
