# Services Migration Tracking

This document tracks all services in app-web and their migration status to shared-services.

## Services Overview

### 1. ✅ auth.service.ts
- `login(data: LoginRequest): Promise<AuthResponse>`
- `register(data: RegisterRequest): Promise<AuthResponse>`
- `logout(): Promise<void>`
- `getProfile(): Promise<IUserPublic>`
- `refreshToken(): Promise<AuthResponse>`
- `requestPasswordReset(email: string): Promise<void>`
- `resetPassword(token: string, password: string): Promise<void>`
- `verifyEmail(email: string): Promise<void>`
- `verifyEmailCode(email: string, code: string): Promise<void>`
- `resendVerificationCode(email: string): Promise<void>`

**Status**: Already implemented in shared-services as AuthService

### 2. ❌ product.service.ts
- `searchProducts(params?: SearchProductsParams): Promise<{ products: IProduct[]; total: number }>`
- `getProduct(id: string): Promise<IProduct>`
- `getFeaturedProducts(limit?: number): Promise<IProduct[]>`
- `getProductsByCategory(categoryId: string, params?: SearchProductsParams): Promise<{ products: IProduct[]; total: number }>`
- `getCategories(): Promise<ICategory[]>`

**Status**: Needs to be migrated to shared-services

### 3. ❌ cart.service.ts
- `getCart(): Promise<ICart>`
- `addToCart(productId: string, quantity: number): Promise<ICart>`
- `updateCartItem(itemId: string, quantity: number): Promise<ICart>`
- `removeFromCart(itemId: string): Promise<ICart>`
- `clearCart(): Promise<void>`
- `syncCart(guestCartId: string): Promise<ICart>`

**Status**: Needs to be migrated to shared-services

### 4. ❌ order.service.ts
- `createOrder(data: ICreateOrder): Promise<IOrder>`
- `getMyOrders(params?: { page?: number; limit?: number; status?: string }): Promise<{ orders: IOrder[]; total: number }>`
- `getOrder(id: string): Promise<IOrder>`
- `cancelOrder(id: string): Promise<IOrder>`
- `getOrderStats(): Promise<IOrderStats>`
- `checkoutFromCart(data: ICheckoutRequest): Promise<IOrder>`

**Status**: Needs to be migrated to shared-services

### 5. ❌ category.service.ts
- `getCategories(): Promise<ICategory[]>`
- `getCategory(id: string): Promise<ICategory>`
- `createCategory(data: ICreateCategoryRequest): Promise<ICategory>` (admin)
- `updateCategory(id: string, data: IUpdateCategoryRequest): Promise<ICategory>` (admin)
- `deleteCategory(id: string): Promise<void>` (admin)

**Status**: Needs to be migrated to shared-services

### 6. ❌ commission.service.ts
- `getMyCommissions(params?: { page?: number; limit?: number }): Promise<{ commissions: ICommission[]; total: number }>`
- `getCommissionStats(): Promise<ICommissionStats>`
- `getNetwork(): Promise<INetworkNode>`
- `getNetworkStats(): Promise<INetworkStats>`
- `getCommission(id: string): Promise<ICommission>`
- `initializeCommissionSystem(): Promise<void>` (admin)
- `getCommissionData(): Promise<ICommissionData>`
- `getCommissionStructure(): Promise<ICommissionStructure>`

**Status**: Needs to be migrated to shared-services

### 7. ❌ membership.service.ts
- `getMembershipTiers(): Promise<IMembershipTier[]>`
- `getCurrentMembership(): Promise<IMembership>`
- `joinMembership(tierId: string): Promise<IMembership>`
- `upgradeMembership(tierId: string): Promise<IMembership>`
- `cancelMembership(): Promise<void>`
- `getMembershipStats(): Promise<IMembershipStats>`
- `checkUpgradeEligibility(targetTierId: string): Promise<{ eligible: boolean; reason?: string }>`

**Status**: Needs to be migrated to shared-services

### 8. ❌ user.service.ts
- `getMyProfile(): Promise<IUserPublic>`
- `updateMyProfile(data: IUpdateProfile): Promise<IUserPublic>`
- `uploadProfilePhoto(file: File): Promise<{ url: string }>`
- `changePassword(data: IChangePassword): Promise<void>`
- `getUserById(id: string): Promise<IUserPublic>` (admin)
- `listUsers(params?: IListUsersParams): Promise<{ users: IUserPublic[]; total: number }>` (admin)
- `updateUser(id: string, data: IUpdateUser): Promise<IUserPublic>` (admin)
- `deleteUser(id: string): Promise<void>` (admin)

**Status**: Needs to be migrated to shared-services

### 9. ❌ profile.service.ts
- `getProfile(): Promise<IUserProfile>`
- `updateProfile(data: IUpdateProfile): Promise<IUserProfile>`
- `changePassword(data: IChangePassword): Promise<void>`
- `uploadProfileImage(file: File): Promise<{ url: string }>`
- `deleteAccount(): Promise<void>`
- `getReferralCode(): Promise<string>`
- `generateReferralCode(): Promise<string>`

**Status**: Needs to be migrated to shared-services

### 10. ❌ partner.service.ts
- `getPartnerDashboard(): Promise<IPartnerDashboard>`
- `getReferralCode(): Promise<{ code: string; link: string }>`
- `getPartnerNetwork(): Promise<IPartnerNetwork>`
- `getNetworkStats(): Promise<INetworkStats>`
- `getPartnerCommissions(params?: { page?: number; limit?: number }): Promise<{ commissions: ICommission[]; total: number }>`
- `getCommissionStats(): Promise<ICommissionStats>`
- `sendInvitation(data: ISendInvitation): Promise<void>`
- `getReferralLink(): Promise<string>`
- `generateShareContent(platform: string): Promise<IShareContent>`

**Status**: Needs to be migrated to shared-services

### 11. ❌ dashboard.service.ts
- `getOrderStats(): Promise<IOrderStats>`
- `getCommissionStats(): Promise<ICommissionStats>`
- `getNetworkStats(): Promise<INetworkStats>`
- `getCommissionSummary(): Promise<ICommissionSummary>`
- `getMembershipStats(): Promise<IMembershipStats>`
- `getNetworkVisualization(): Promise<INetworkVisualization>`
- `getDashboardOverview(): Promise<IDashboardOverview>`
- `getAdminDashboard(): Promise<IAdminDashboard>` (admin)

**Status**: Needs to be migrated to shared-services

### 12. ❌ promotion.service.ts
- `getPromotions(params?: { active?: boolean }): Promise<IPromotion[]>`
- `getPromotion(id: string): Promise<IPromotion>`
- `getPromotionByCode(code: string): Promise<IPromotion>`
- `validatePromotion(code: string, orderTotal: number): Promise<IValidatePromotionResponse>`
- `applyPromotionToCart(code: string): Promise<ICart>`
- `createPromotion(data: ICreatePromotion): Promise<IPromotion>` (admin)
- `updatePromotion(id: string, data: IUpdatePromotion): Promise<IPromotion>` (admin)
- `deletePromotion(id: string): Promise<void>` (admin)
- `getActivePromotions(): Promise<IPromotion[]>`

**Status**: Needs to be migrated to shared-services

### 13. ❌ ai.service.ts
- `sendChatMessage(message: string): Promise<IChatResponse>`
- `getRecommendations(userId?: string): Promise<IProduct[]>`
- `getPersonalizedRecommendations(): Promise<IProduct[]>`
- `getSimilarProducts(productId: string, limit?: number): Promise<IProduct[]>`
- `getTrendingProducts(limit?: number): Promise<IProduct[]>`
- `sendChatbotMessage(message: string, context?: IChatContext): Promise<IChatbotResponse>`
- `getChatHistory(): Promise<IChatHistory>`
- `clearChatHistory(): Promise<void>`
- `getSearchSuggestions(query: string): Promise<string[]>`
- `recordInteraction(data: IInteraction): Promise<void>`

**Status**: Needs to be migrated to shared-services

## Support Files

### api-client.ts
- Core HTTP client with axios
- Handles authentication, token refresh
- Server vs client-side request routing

### base.service.ts
- Abstract base class for services
- Error handling
- Query string building

## Migration Strategy

1. **Phase 1**: Auth (✅ Done)
2. **Phase 2**: Core E-commerce (Product, Cart, Order, Category)
3. **Phase 3**: MLM Features (Commission, Partner, Network)
4. **Phase 4**: User Management (User, Profile, Membership)
5. **Phase 5**: Support Features (Dashboard, Promotion, AI)

## Service Provider Pattern

Instead of importing individual services, we'll create a service provider that instantiates all services with proper configuration:

```typescript
// services/index.ts
import { AuthService, ProductService, CartService, ... } from '@app/shared-services';

const services = {
  auth: new AuthService({ dataSource: new ApiAuthDataSource(...) }),
  product: new ProductService({ dataSource: new ApiProductDataSource(...) }),
  cart: new CartService({ dataSource: new ApiCartDataSource(...) }),
  // ... etc
};

export default services;
```

This way, components and contexts only need to import from one place.