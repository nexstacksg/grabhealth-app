'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { QuoteIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        'My experience with GrabHealth is a complete success, from customer service, wide range of products, clean store, purchasing experience, the newsletter. Thank you!',
      name: 'Leona Paul',
      title: 'CEO of PaulCo',
      image: '/placeholder.svg?height=100&width=100',
    },
    {
      quote:
        "The membership benefits are incredible. I've saved so much on my regular health supplements and the monthly gifts are always useful.",
      name: 'Michael Johnson',
      title: 'Regular Customer',
      image: '/placeholder.svg?height=100&width=100',
    },
    {
      quote:
        'The lab test discounts have been a game changer for me. I can now afford regular check-ups which has improved my overall health.',
      name: 'Sarah Williams',
      title: 'Premium Member',
      image: '/placeholder.svg?height=100&width=100',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const totalSlides = testimonials.length;
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  // Auto-advance slides on mobile
  useEffect(() => {
    if (isMobile) {
      const interval = setInterval(() => {
        nextSlide();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isMobile, currentSlide]);

  return (
    <section className="py-4 md:py-4 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
            SEE WHAT OUR CUSTOMERS ARE SAYING
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Over 15,000 happy customers trust GrabHealth AI for their health
            needs.
          </p>
        </div>

        {/* Desktop view - Grid layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-none shadow-sm">
              <CardContent className="p-6">
                <QuoteIcon className="h-8 w-8 text-emerald-300 mb-4" />
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="mr-4">
                    <Image
                      src={testimonial.image || '/placeholder.svg'}
                      alt={testimonial.name}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile view - Carousel */}
        <div className="md:hidden relative">
          <div ref={slideRef} className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <Card className="border-none shadow-sm mx-1">
                    <CardContent className="p-6">
                      <QuoteIcon className="h-8 w-8 text-emerald-300 mb-4" />
                      <p className="text-gray-700 mb-6 italic">
                        "{testimonial.quote}"
                      </p>
                      <div className="flex items-center">
                        <div className="mr-4">
                          <Image
                            src={testimonial.image || '/placeholder.svg'}
                            alt={testimonial.name}
                            width={50}
                            height={50}
                            className="rounded-full"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold">{testimonial.name}</h4>
                          <p className="text-sm text-gray-500">
                            {testimonial.title}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel controls */}
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
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentSlide ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
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
        </div>
      </div>
    </section>
  );
}
