import { Router } from 'express';
import { createReview, getTailorReviews, respondToReview } from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('customer'), createReview);
router.get('/tailor/:tailorId', getTailorReviews);
router.put('/:id/respond', authenticate, authorize('tailor'), respondToReview);

export default router;
