'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-white border border-gray-100 h-[280px] sm:h-[320px] md:h-[450px]">
        <Image
          src="/placeholder.svg?height=400&width=400"
          alt={productName}
          fill
          className="object-contain p-3 sm:p-4 md:p-6"
          priority
        />
      </div>
    );
  }

  // If only one image, show it without carousel
  if (images.length === 1) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-white border border-gray-100 h-[280px] sm:h-[320px] md:h-[450px] group">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <Image
          src={images[0]}
          alt={productName}
          fill
          className="object-contain p-3 sm:p-4 md:p-6 transition-transform duration-300 group-hover:scale-105"
          priority
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Carousel */}
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative rounded-xl overflow-hidden bg-white border border-gray-100 h-[280px] sm:h-[320px] md:h-[450px] group">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Image
                  src={image}
                  alt={`${productName} - Image ${index + 1}`}
                  fill
                  className="object-contain p-3 sm:p-4 md:p-6 transition-transform duration-300 group-hover:scale-105"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </>
        )}
      </Carousel>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 justify-center">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                'relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200',
                current === index + 1
                  ? 'border-emerald-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <Image
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="text-center text-sm text-gray-500">
          {current} / {count}
        </div>
      )}
    </div>
  );
}