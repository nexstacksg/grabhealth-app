'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { ProductChatbot } from '@/components/product-chatbot';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <ProductChatbot />
    </>
  );
}
