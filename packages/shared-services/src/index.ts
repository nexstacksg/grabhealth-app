// Services
export { AuthService } from './services/AuthService';
export {
  ProductService,
  type PriceRange,
  type EnhancedProductSearchParams,
} from './services/ProductService';
export { CartService } from './services/CartService';
export { OrderService } from './services/OrderService';
export { CommissionService } from './services/CommissionService';
export { UserService } from './services/UserService';
export { DashboardService } from './services/DashboardService';
export {
  MembershipService,
  type MembershipTier,
} from './services/MembershipService';

// Re-export types from shared-types for convenience
export type {
  TierConfig,
  ServiceMembershipTier,
  IMembership,
  MembershipContextState,
  MembershipContextType,
  CartContextType,
} from '@app/shared-types';
export { PartnerService } from './services/PartnerService';
export { PromotionService } from './services/PromotionService';
export { CategoryService } from './services/CategoryService';
export { ProfileService } from './services/ProfileService';
export { AIService } from './services/AIService';
export { HealthcarePartnerService } from './services/HealthcarePartnerService';
export { BookingService } from './services/BookingService';
export { AuthGuardService } from './services/AuthGuardService';
export { PartnerAuthService } from './services/PartnerAuthService';

// Re-export types from shared-types for convenience
export type {
  AuthGuardOptions,
  AuthGuardResult,
  PartnerInfo,
  PartnerAuthResult,
} from '@app/shared-types';

// Data Sources
export { BaseApiDataSource } from './adapters/api/BaseApiDataSource';
export { ApiAuthDataSource } from './adapters/api/ApiAuthDataSource';
export { PrismaAuthDataSource } from './adapters/prisma/PrismaAuthDataSource';
export { MockAuthDataSource } from './adapters/mock/MockAuthDataSource';
export { ApiProductDataSource } from './adapters/api/ApiProductDataSource';
export { ApiCartDataSource } from './adapters/api/ApiCartDataSource';
export { ApiOrderDataSource } from './adapters/api/ApiOrderDataSource';
export { ApiCommissionDataSource } from './adapters/api/ApiCommissionDataSource';
export { ApiUserDataSource } from './adapters/api/ApiUserDataSource';
export { ApiDashboardDataSource } from './adapters/api/ApiDashboardDataSource';
export { ApiMembershipDataSource } from './adapters/api/ApiMembershipDataSource';
export { ApiPartnerDataSource } from './adapters/api/ApiPartnerDataSource';
export { ApiPromotionDataSource } from './adapters/api/ApiPromotionDataSource';
export { ApiCategoryDataSource } from './adapters/api/ApiCategoryDataSource';
export { ApiProfileDataSource } from './adapters/api/ApiProfileDataSource';
export { ApiAIDataSource } from './adapters/api/ApiAIDataSource';
export { ApiHealthcarePartnerDataSource } from './adapters/api/ApiHealthcarePartnerDataSource';
export { ApiBookingDataSource } from './adapters/api/ApiBookingDataSource';
export { BookingDataSource } from './adapters/BookingDataSource';
export { BaseDataSource } from './adapters/BaseDataSource';

// Interfaces
export { IAuthDataSource } from './interfaces/IAuthDataSource';
export { IProductDataSource } from './interfaces/IProductDataSource';
export { ICartDataSource } from './interfaces/ICartDataSource';
export { IOrderDataSource } from './interfaces/IOrderDataSource';
export { ICommissionDataSource } from './interfaces/ICommissionDataSource';
export { IUserDataSource } from './interfaces/IUserDataSource';
export { IDashboardDataSource } from './interfaces/IDashboardDataSource';
export { IMembershipDataSource } from './interfaces/IMembershipDataSource';
export { IPartnerDataSource } from './interfaces/IPartnerDataSource';
export { IPromotionDataSource } from './interfaces/IPromotionDataSource';
export { ICategoryDataSource } from './interfaces/ICategoryDataSource';
export { IProfileDataSource } from './interfaces/IProfileDataSource';
export { IAIDataSource } from './interfaces/IAIDataSource';
export { IHealthcarePartnerDataSource } from './interfaces/IHealthcarePartnerDataSource';
export { IBookingDataSource } from './interfaces/IBookingDataSource';

// Types
export * from './types';

// Utils
export * from './utils/errors';
export * from './utils/validation';
export * from './utils/apiStateManager';
