import { Router } from 'express';
import { BusinessController } from '../controllers/BusinessController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.post('/', BusinessController.create);
router.get('/', BusinessController.list);
router.get('/slug/:slug', BusinessController.getBySlug);
router.get('/:id', BusinessController.getById);
router.put('/:id', BusinessController.update);
router.delete('/:id', BusinessController.remove);

export default router;
