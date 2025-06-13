import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { CartProvider } from '@/hooks/use-cart';
import { MembershipProvider } from '@/hooks/use-membership';
import { AuthProvider } from '@/contexts/AuthContext';
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
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <MembershipProvider>
              <CartProvider>
                <LayoutWrapper>
                  <main className="min-h-screen pb-4 md:pb-8">{children}</main>
                </LayoutWrapper>
                <Toaster position="top-right" richColors />
              </CartProvider>
            </MembershipProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
