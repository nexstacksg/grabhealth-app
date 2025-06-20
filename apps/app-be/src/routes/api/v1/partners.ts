import { Router } from 'express';
import { partnerController } from '../../../controllers/partner/partnerController';
import { validateRequest } from '../../../middleware/validation/validationMiddleware';
import { query, param } from 'express-validator';

const router = Router();

// Public routes
router.get(
  '/',
  [
    query('city').optional().isString(),
    query('specialization').optional().isString(),
    query('rating').optional().isFloat({ min: 0, max: 5 }),
    query('search').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  partnerController.getPartners
);

router.get(
  '/:id',
  [param('id').isString().notEmpty()],
  validateRequest,
  partnerController.getPartner
);

router.get(
  '/:id/services',
  [
    param('id').isString().notEmpty(),
    query('category').optional().isString(),
    query('isActive').optional().isBoolean(),
  ],
  validateRequest,
  partnerController.getPartnerServices
);

router.get(
  '/:id/calendar/:month',
  [
    param('id').isString().notEmpty(),
    param('month').matches(/^\d{4}-\d{2}$/), // YYYY-MM format
  ],
  validateRequest,
  partnerController.getPartnerCalendar
);

router.get(
  '/:id/available-slots/:date',
  [
    param('id').isString().notEmpty(),
    param('date').isISO8601({ strict: true }).toDate(),
    query('detailed').optional().isBoolean(),
  ],
  validateRequest,
  partnerController.getAvailableSlots
);

export default router;
