// Re-export all services from the factory
export {
  authService,
  productService,
  cartService,
  orderService,
  commissionService,
  userService,
  dashboardService,
  membershipService,
  partnerService,
  promotionService,
  categoryService,
  profileService,
  aiService,
  services,
} from './serviceFactory';

// Export auth service shared for backward compatibility
export { authService as authServiceShared } from './serviceFactory';

// Export default
export { default } from './serviceFactory';