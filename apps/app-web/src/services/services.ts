/**
 * Central services export - provides all services as a single object
 * This mimics the structure of the old @/lib/services for easier migration
 */

import { authService } from './auth.service';
import { productService } from './product.service';
import { categoryService } from './category.service';
import { cartService } from './cart.service';
import { orderService } from './order.service';
import { partnerService } from './partner.service';
import { commissionService } from './commission.service';
import { dashboardService } from './dashboard.service';
import { profileService } from './profile.service';
import { aiService } from './ai.service';
import { bookingsService } from './bookings.service';
import { partnersService } from './partners.service';
import { promotionService } from './promotion.service';

const services = {
  auth: authService,
  product: productService,
  category: categoryService,
  cart: cartService,
  order: orderService,
  partner: partnerService,
  commission: commissionService,
  dashboard: dashboardService,
  profile: profileService,
  ai: aiService,
  bookings: bookingsService,
  partners: partnersService,
  promotion: promotionService,
  // Note: 'user' service is not created as it seems to be handled by profile/auth
};

export default services;