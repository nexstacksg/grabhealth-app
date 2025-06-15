// Re-export all services from lib/services
export {
  auth as authService,
  product as productService,
  cart as cartService,
  order as orderService,
  commission as commissionService,
  user as userService,
  dashboard as dashboardService,
  membership as membershipService,
  partner as partnerService,
  promotion as promotionService,
  category as categoryService,
  profile as profileService,
  ai as aiService,
} from '@/lib/services';

// Export default services
export { default as services } from '@/lib/services';

// Export auth service shared for backward compatibility
export { auth as authServiceShared } from '@/lib/services';

// Note: Individual services are already exported above
// No need for duplicate exports