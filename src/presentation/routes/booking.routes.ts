// ===========================================
// Routes: Bookings
// ===========================================

import { Router } from 'express';
import { BookingController } from '../controllers/BookingController';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../../domain/entities/User';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

router.post('/', BookingController.create);
router.get('/', BookingController.list);
router.get('/stats', authorize(UserRole.ADMIN, UserRole.PROFESSIONAL), BookingController.stats);
router.get('/:id', BookingController.getById);
router.patch('/:id/confirm', authorize(UserRole.ADMIN, UserRole.PROFESSIONAL), BookingController.confirm);
router.patch('/:id/cancel', BookingController.cancel);

export default router;
