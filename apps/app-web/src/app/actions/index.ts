/**
 * Server Actions Index
 * 
 * Central export point for all server actions.
 * Actions are organized by domain for better maintainability.
 */

// Authentication actions
export {
  loginAction,
  registerAction,
  logoutAction,
  getCurrentUserAction,
} from './auth.actions';

// Order actions
export {
  getMyOrdersAction,
  getOrderAction,
  createOrderAction,
  cancelOrderAction,
} from './order.actions';

// Booking actions
export {
  createBookingAction,
} from './booking.actions';

// Payment actions
export {
  createCheckoutSession,
  verifyHitPayPayment,
} from './payment.actions';

// Generic API action
export {
  apiAction,
} from './api.actions';