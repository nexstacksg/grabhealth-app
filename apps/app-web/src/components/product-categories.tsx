'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Thermometer,
  Pill,
  NutIcon as Vitamins,
  Heart,
  Stethoscope,
  Brain,
  Droplet,
  LigatureIcon as Bandage,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { JSX } from 'react';

export default function ProductCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        // Use a consistent approach for fetching that works in both environments
        const response = await fetch('/api/product-categories');

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        setCategories(data);
        setError(null);
      } catch (err) {
        setError('Error loading categories. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Map category names to icons
  const getIconForCategory = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      Thermometer: <Thermometer className="h-8 w-8 text-emerald-500" />,
      Pill: <Pill className="h-8 w-8 text-emerald-500" />,
      Vitamins: <Vitamins className="h-8 w-8 text-emerald-500" />,
      Heart: <Heart className="h-8 w-8 text-emerald-500" />,
      Stethoscope: <Stethoscope className="h-8 w-8 text-emerald-500" />,
      Brain: <Brain className="h-8 w-8 text-emerald-500" />,
      Droplet: <Droplet className="h-8 w-8 text-emerald-500" />,
      Bandage: <Bandage className="h-8 w-8 text-emerald-500" />,
    };

    return icons[iconName] || <Pill className="h-8 w-8 text-emerald-500" />;
  };

  const nextSlide = () => {
    const maxSlide = Math.ceil(categories.length / 2) - 1;
    setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
  };

  const prevSlide = () => {
    const maxSlide = Math.ceil(categories.length / 2) - 1;
    setCurrentSlide((prev) => (prev === 0 ? maxSlide : prev - 1));
  };

  // Auto-advance slides on mobile
  useEffect(() => {
    if (isMobile && categories.length > 0) {
      const interval = setInterval(() => {
        nextSlide();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isMobile, currentSlide, categories.length]);

  if (loading) {
    return (
      <section className="py-4 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center">
            CATEGORIES
          </h2>
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-4 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center">
            CATEGORIES
          </h2>
          <div className="text-center text-red-500">{error}</div>
        </div>
      </section>
    );
  }

  // Function to render a category card
  const renderCategoryCard = (category: any) => (
    <Link key={category.id} href={`/products?category=${category.name}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-none bg-gray-50">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="mb-4 p-3 bg-white rounded-full shadow-sm">
            {getIconForCategory(category.icon)}
          </div>
          <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
          <p className="text-sm text-gray-600">{category.description}</p>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <section className="py-4 md:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center">
          CATEGORIES
        </h2>

        {/* Desktop view - Grid layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category: any) => renderCategoryCard(category))}
        </div>

        {/* Mobile view - Carousel with 2 items per slide */}
        <div className="md:hidden relative">
          <div ref={slideRef} className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: Math.ceil(categories.length / 2) }).map(
                (_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-2 gap-4">
                      {categories
                        .slice(slideIndex * 2, slideIndex * 2 + 2)
                        .map((category: any) => (
                          <div key={category.id} className="px-1">
                            <Link href={`/products?category=${category.name}`}>
                              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-none bg-gray-50">
                                <CardContent className="p-3 flex flex-col items-center text-center">
                                  <div className="mb-2 p-2 bg-white rounded-full shadow-sm">
                                    {getIconForCategory(category.icon)}
                                  </div>
                                  <h3 className="font-semibold text-sm mb-1">
                                    {category.name}
                                  </h3>
                                </CardContent>
                              </Card>
                            </Link>
                          </div>
                        ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Carousel controls */}
          {categories.length > 2 && (
            <div className="flex justify-center items-center mt-6 gap-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex gap-2">
                {Array.from({ length: Math.ceil(categories.length / 2) }).map(
                  (_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full ${index === currentSlide ? 'bg-emerald-500' : 'bg-gray-300'}`}
                      onClick={() => setCurrentSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={nextSlide}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
