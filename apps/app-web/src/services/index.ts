/**
 * Services Index - Export all services
 */

export { authService } from './auth.service';
export { partnerService } from './unified-partner.service';
export { productService, type PriceRange } from './product.service';
export { categoryService } from './category.service';
export { cartService } from './cart.service';
export { orderService } from './order.service';
export { commissionService } from './commission.service';
export { membershipService } from './membership.service';
export { dashboardService } from './dashboard.service';
export { profileService } from './profile.service';
export { aiService } from './ai.service';
export { bookingsService } from './bookings.service';
export { promotionService } from './promotion.service';
export { paymentService } from './payment.service';

// Export unified API client from lib
export { apiClient } from '@/lib/api-client';

// Export for backward compatibility (will be removed later)
export { partnerService as partnersService } from './unified-partner.service';

// Export the clean API interface
export { api } from './api.service';

// Export base service for extending
export { BaseService } from './base.service';

// Export default services object for backward compatibility
export { default as services } from './services';
export { default } from './services';