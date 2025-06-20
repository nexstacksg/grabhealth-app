import { Router } from 'express';
import { authenticate } from '../../../middleware/auth/authenticate';
import { requirePartnerAuth } from '../../../middleware/auth/partnerAuth';
import { partnerDashboardController } from '../../../controllers/partner/partnerDashboardController';
import { validateRequest } from '../../../middleware/validation/validationMiddleware';
import { body, param, query } from 'express-validator';

const router = Router();

// All routes require authentication and partner access
router.use(authenticate);
router.use(requirePartnerAuth);

// Dashboard statistics
router.get('/stats', partnerDashboardController.getDashboardStats);

// Today's schedule
router.get('/schedule/today', partnerDashboardController.getTodaySchedule);

// Bookings management
router.get(
  '/bookings',
  [
    query('status')
      .optional()
      .isIn(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
    query('fromDate').optional().isISO8601(),
    query('toDate').optional().isISO8601(),
    query('serviceId').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  partnerDashboardController.getPartnerBookings
);

router.patch(
  '/bookings/:id/status',
  [
    param('id').isString().notEmpty(),
    body('status').isIn(['CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
    body('notes').optional().isString(),
  ],
  validateRequest,
  partnerDashboardController.updateBookingStatus
);

// Services management
router.get('/services', partnerDashboardController.getPartnerServices);

router.post(
  '/services',
  [
    body('name').isString().notEmpty(),
    body('description').optional().isString(),
    body('duration').isInt({ min: 15 }),
    body('price').isFloat({ min: 0 }),
    body('category').isString().notEmpty(),
    body('isActive').optional().isBoolean(),
    body('requiresApproval').optional().isBoolean(),
    body('maxBookingsPerDay').optional().isInt({ min: 1 }),
  ],
  validateRequest,
  partnerDashboardController.createPartnerService
);

router.put(
  '/services/:id',
  [
    param('id').isString().notEmpty(),
    body('name').isString().notEmpty(),
    body('description').optional().isString(),
    body('duration').isInt({ min: 15 }),
    body('price').isFloat({ min: 0 }),
    body('category').isString().notEmpty(),
    body('isActive').optional().isBoolean(),
    body('requiresApproval').optional().isBoolean(),
    body('maxBookingsPerDay').optional().isInt({ min: 1 }),
  ],
  validateRequest,
  partnerDashboardController.updatePartnerService
);

router.delete(
  '/services/:id',
  [param('id').isString().notEmpty()],
  validateRequest,
  partnerDashboardController.deletePartnerService
);

// Availability management
router.get('/availability', partnerDashboardController.getPartnerAvailability);

router.put(
  '/availability',
  [
    body('availability').isArray(),
    body('availability.*.dayOfWeek').isInt({ min: 0, max: 6 }),
    body('availability.*.startTime').matches(
      /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    ),
    body('availability.*.endTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    body('availability.*.slotDuration').optional().isInt({ min: 15 }),
    body('availability.*.maxBookingsPerSlot').optional().isInt({ min: 1 }),
  ],
  validateRequest,
  partnerDashboardController.updatePartnerAvailability
);

// Profile management
router.get('/profile', partnerDashboardController.getPartnerProfile);

router.put(
  '/profile',
  [
    body('name').optional().isString().notEmpty(),
    body('description').optional().isString(),
    body('address').optional().isString(),
    body('city').optional().isString(),
    body('state').optional().isString(),
    body('postalCode').optional().isString(),
    body('phone').optional().isString(),
    body('website').optional().isURL(),
    body('specializations').optional().isArray(),
    body('operatingHours').optional().isObject(),
  ],
  validateRequest,
  partnerDashboardController.updatePartnerProfile
);

// Days off management
router.get('/days-off', partnerDashboardController.getPartnerDaysOff);

router.post(
  '/days-off',
  [
    body('date').isISO8601({ strict: true }).toDate(),
    body('reason').optional().isString(),
    body('isRecurring').optional().isBoolean(),
    body('recurringType').optional().isIn(['WEEKLY', 'ANNUAL']),
    body('dayOfWeek').optional().isInt({ min: 0, max: 6 }),
  ],
  validateRequest,
  partnerDashboardController.createPartnerDayOff
);

router.delete(
  '/days-off/:id',
  [param('id').isString().notEmpty()],
  validateRequest,
  partnerDashboardController.deletePartnerDayOff
);

export default router;
