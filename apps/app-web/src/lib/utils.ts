import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price with the $ symbol and proper decimal places
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Alias for formatPrice to maintain consistency
 */
export const formatCurrency = formatPrice;

/**
 * Creates a proper API URL that works in both server and client environments
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // In browser environment
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/${cleanPath}`;
  }

  // In server environment
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return `${baseUrl}/api/${cleanPath}`;
}
