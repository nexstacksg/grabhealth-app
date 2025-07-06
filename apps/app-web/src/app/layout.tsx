import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { RootProvider } from '@/providers/root-provider';
import { Toaster } from 'sonner';
import { LayoutWrapper } from '@/components/layout-wrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GrabHealth AI - Your Health Membership Platform',
  description:
    'Get exclusive health benefits, discounts on products and lab services',
  generator: 'v0.dev',
  icons: {
    icon: '/freepik__background__83849 2.svg',
    apple: '/freepik__background__83849 2.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <RootProvider>
          <LayoutWrapper>
            <main className="min-h-screen pb-4 md:pb-8">{children}</main>
          </LayoutWrapper>
          <Toaster position="top-center" richColors duration={1500} />
        </RootProvider>
      </body>
    </html>
  );
}
