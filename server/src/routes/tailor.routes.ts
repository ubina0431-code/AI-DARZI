import { Router } from 'express';
import {
  getTailors, getTailorById, updateTailorProfile, getMyTailorProfile,
  toggleFavorite, getCities,
} from '../controllers/tailor.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getTailors);
router.get('/cities', getCities);
router.get('/me', authenticate, authorize('tailor'), getMyTailorProfile);
router.get('/:id', getTailorById);
router.put('/profile', authenticate, authorize('tailor'), updateTailorProfile);
router.post('/:id/favorite', authenticate, authorize('customer'), toggleFavorite);

export default router;
