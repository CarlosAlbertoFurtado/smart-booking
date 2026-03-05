import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authenticate, AuthController.me);

export default router;
