'use client';

import * as React from 'react';
import { IProductVariant } from '@app/shared-types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface ProductVariantSelectorProps {
  variants: IProductVariant[];
  selectedVariant: IProductVariant | null;
  onVariantSelect: (variant: IProductVariant) => void;
  className?: string;
}

export function ProductVariantSelector({
  variants,
  selectedVariant,
  onVariantSelect,
  className
}: ProductVariantSelectorProps) {
  if (!variants || variants.length === 0) {
    return null;
  }

  // Sort variants by unit quantity (single bottles first)
  const sortedVariants = [...variants].sort((a, b) => a.unitQuantity - b.unitQuantity);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sortedVariants.map((variant) => {
          const isSelected = selectedVariant?.documentId === variant.documentId;
          const perUnitPrice = variant.price / variant.unitQuantity;
          
          return (
            <div
              key={variant.documentId}
              className={cn(
                'relative rounded-lg border p-4 transition-all cursor-pointer',
                isSelected 
                  ? 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-500 ring-opacity-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
                variant.isMostPopular && !isSelected && 'border-orange-300'
              )}
              onClick={() => onVariantSelect(variant)}
            >
              {variant.isMostPopular && (
                <Badge 
                  className="absolute -top-2 right-4 bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-0.5"
                >
                  Most Popular
                </Badge>
              )}
              
              <div className="space-y-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{variant.name}</h3>
                  <p className="text-xs text-gray-500">
                    {variant.unitQuantity > 1 
                      ? `${variant.unitQuantity} ${variant.unitLabel}s per ${variant.unitLabel.toLowerCase() === 'box' ? 'box' : 'pack'}`
                      : `Single ${variant.unitLabel}`
                    }
                  </p>
                </div>
                
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(variant.price)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(perUnitPrice)} per {variant.unitLabel}
                  </p>
                  {variant.savingsAmount && variant.savingsAmount > 0 && (
                    <p className="text-xs font-medium text-green-600 mt-1">
                      Save {formatCurrency(variant.savingsAmount)}
                    </p>
                  )}
                </div>
                
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}