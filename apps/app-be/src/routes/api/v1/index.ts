import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import testRoutes from './test';
import productRoutes from './products';
import categoryRoutes from './categories';
import orderRoutes from './orders';
import cartRoutes from './cart';
import commissionRoutes from './commissions';
import membershipRoutes from './memberships';
import promotionRoutes from './promotions';
import aiRoutes from './ai';
import partnerRoutes from './partners';
import bookingRoutes from './bookings';
import partnerDashboardRoutes from './partner';
import uploadRoutes from '../../upload/uploadRoutes';

const router = Router();

// Welcome message
router.get('/', (_req, res) => {
  res.json({
    message: 'API Template v1',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      test: '/api/v1/test',
      products: '/api/v1/products',
      categories: '/api/v1/categories',
      orders: '/api/v1/orders',
      cart: '/api/v1/cart',
      commissions: '/api/v1/commissions',
      memberships: '/api/v1/memberships',
      promotions: '/api/v1/promotions',
      ai: '/api/v1/ai',
      partners: '/api/v1/partners',
      bookings: '/api/v1/bookings',
      partner: '/api/v1/partner',
      upload: '/api/v1/upload',
    },
  });
});

// Route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/test', testRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/commissions', commissionRoutes);
router.use('/memberships', membershipRoutes);
router.use('/promotions', promotionRoutes);
router.use('/ai', aiRoutes);
router.use('/partners', partnerRoutes);
router.use('/bookings', bookingRoutes);
router.use('/partner', partnerDashboardRoutes);
router.use('/upload', uploadRoutes);

export default router;
