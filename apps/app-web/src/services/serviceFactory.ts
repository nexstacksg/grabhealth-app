import {
  AuthService,
  ProductService,
  CartService,
  OrderService,
  CommissionService,
  UserService,
  DashboardService,
  MembershipService,
  PartnerService,
  PromotionService,
  CategoryService,
  ProfileService,
  AIService,
  ApiAuthDataSource,
  ApiProductDataSource,
  ApiCartDataSource,
  ApiOrderDataSource,
  ApiCommissionDataSource,
  ApiUserDataSource,
  ApiDashboardDataSource,
  ApiMembershipDataSource,
  ApiPartnerDataSource,
  ApiPromotionDataSource,
  ApiCategoryDataSource,
  ApiProfileDataSource,
  ApiAIDataSource,
} from '@app/shared-services';

// Get API URL from environment or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Token getter for authenticated requests
const getToken = async (): Promise<string | null> => {
  // In Next.js app, we don't have direct access to cookies on client side
  // The auth is handled by cookies automatically
  return null;
};

// Create service instances
export const authService = new AuthService({
  dataSource: new ApiAuthDataSource(API_URL, getToken),
});

export const productService = new ProductService({
  dataSource: new ApiProductDataSource(API_URL, getToken),
});

export const cartService = new CartService({
  dataSource: new ApiCartDataSource(API_URL, getToken),
});

export const orderService = new OrderService({
  dataSource: new ApiOrderDataSource(API_URL, getToken),
});

export const commissionService = new CommissionService({
  dataSource: new ApiCommissionDataSource(API_URL, getToken),
});

export const userService = new UserService({
  dataSource: new ApiUserDataSource(API_URL, getToken),
});

export const dashboardService = new DashboardService({
  dataSource: new ApiDashboardDataSource(API_URL, getToken),
});

export const membershipService = new MembershipService({
  dataSource: new ApiMembershipDataSource(API_URL, getToken),
});

export const partnerService = new PartnerService({
  dataSource: new ApiPartnerDataSource(API_URL, getToken),
});

export const promotionService = new PromotionService({
  dataSource: new ApiPromotionDataSource(API_URL, getToken),
});

export const categoryService = new CategoryService({
  dataSource: new ApiCategoryDataSource(API_URL, getToken),
});

export const profileService = new ProfileService({
  dataSource: new ApiProfileDataSource(API_URL, getToken),
});

export const aiService = new AIService({
  dataSource: new ApiAIDataSource(API_URL, getToken),
});

// Export all services as a single object for convenience
export const services = {
  auth: authService,
  product: productService,
  cart: cartService,
  order: orderService,
  commission: commissionService,
  user: userService,
  dashboard: dashboardService,
  membership: membershipService,
  partner: partnerService,
  promotion: promotionService,
  category: categoryService,
  profile: profileService,
  ai: aiService,
};

// Export default for backward compatibility
export default services;