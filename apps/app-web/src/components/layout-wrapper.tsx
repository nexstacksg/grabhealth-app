'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ProductChatbot } from '@/components/product-chatbot';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if we're on a partner dashboard route
  const isPartnerDashboard = pathname?.startsWith('/partner');

  // For partner dashboard pages, show no header/footer/chatbot - just the content
  if (isPartnerDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
      <ProductChatbot />
    </>
  );
}
