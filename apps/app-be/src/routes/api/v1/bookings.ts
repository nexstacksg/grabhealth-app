import { Router } from 'express';
import { bookingController } from '../../../controllers/booking/bookingController';
import { validateRequest } from '../../../middleware/validation/validationMiddleware';
import { authenticate } from '../../../middleware/auth/authenticate';
import { body, query, param } from 'express-validator';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// Create a new booking
router.post(
  '/',
  [
    body('partnerId').isString().notEmpty(),
    body('serviceId').isString().notEmpty(),
    body('bookingDate').isISO8601().toDate(),
    body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('notes').optional().isString(),
    body('isFreeCheckup').optional().isBoolean(),
    body('paymentMethod').optional().isString()
  ],
  validateRequest,
  bookingController.createBooking
);

// Get user's bookings
router.get(
  '/',
  [
    query('status').optional().isString(),
    query('fromDate').optional().isISO8601(),
    query('toDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  bookingController.getBookings
);

// Get specific booking
router.get(
  '/:id',
  [
    param('id').isString().notEmpty()
  ],
  validateRequest,
  bookingController.getBooking
);

// Update booking status
router.patch(
  '/:id/status',
  [
    param('id').isString().notEmpty(),
    body('status').isIn(['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']),
    body('cancellationReason').optional().isString()
  ],
  validateRequest,
  bookingController.updateBookingStatus
);

export default router;