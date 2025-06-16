/**
 * Public Service Provider for app-web
 * 
 * This file configures and exports services that don't require authentication.
 * Used for public pages like partners, about, etc.
 */

import { 
  ProductService,
  ApiProductDataSource,
  CategoryService,
  ApiCategoryDataSource,
  PartnerService,
  ApiPartnerDataSource,
} from '@app/shared-services';

// Helper to determine API URL based on environment
const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
};

// No access token for public services
const getAccessToken = async (): Promise<string | null> => {
  return null;
};

// Initialize public services
const createPublicServices = () => {
  const apiUrl = getApiUrl();

  return {
    product: new ProductService({
      dataSource: new ApiProductDataSource(apiUrl, getAccessToken)
    }),
    
    category: new CategoryService({
      dataSource: new ApiCategoryDataSource(apiUrl, getAccessToken)
    }),
    
    partner: new PartnerService({
      dataSource: new ApiPartnerDataSource(apiUrl, getAccessToken)
    }),
  };
};

// Export singleton instance
const publicServices = createPublicServices();
export default publicServices;

// Also export individual services for convenience
export const { 
  product, 
  category,
  partner
} = publicServices;