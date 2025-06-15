/**
 * Service Provider for app-web
 * 
 * This file configures and exports all shared services for use in the app.
 * It handles the platform-specific configuration (API URLs, auth tokens, etc.)
 */

import { 
  AuthService, 
  ApiAuthDataSource,
  ProductService,
  ApiProductDataSource,
  CartService,
  ApiCartDataSource
} from '@app/shared-services';

// Helper to determine API URL based on environment
const getApiUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side: call backend directly
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  } else {
    // Client-side: use Next.js API routes
    return '/api';
  }
};

// Helper to get access token for server-side requests
const getAccessToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const token = cookieStore.get('accessToken');
      return token?.value || null;
    } catch {
      return null;
    }
  }
  // Client-side: cookies are sent automatically
  return null;
};

// Initialize services
const createServices = () => {
  const apiUrl = getApiUrl();

  return {
    auth: new AuthService({
      dataSource: new ApiAuthDataSource(apiUrl, getAccessToken)
    }),
    
    product: new ProductService({
      dataSource: new ApiProductDataSource(apiUrl, getAccessToken)
    }),
    
    cart: new CartService({
      dataSource: new ApiCartDataSource(apiUrl, getAccessToken)
    }),
    
    // Add more services as we migrate them:
    // order: new OrderService({ dataSource: new ApiOrderDataSource(apiUrl, getAccessToken) }),
    // etc...
  };
};

// Export singleton instance
const services = createServices();
export default services;

// Also export individual services for convenience
export const { auth, product, cart } = services;