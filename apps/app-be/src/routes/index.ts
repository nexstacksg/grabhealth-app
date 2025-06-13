import { Router } from 'express';
import v1Routes from './api/v1';

const router = Router();

// API version routing
router.use('/v1', v1Routes);

export default router;
