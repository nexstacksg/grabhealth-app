'use client';

import React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

interface RootProviderProps {
  children: React.ReactNode;
}

/**
 * Root provider that combines all application providers
 * This reduces nesting and makes the provider structure cleaner
 */
export function RootProvider({ children }: RootProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
