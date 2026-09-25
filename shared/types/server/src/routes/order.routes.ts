import { Router } from 'express';
import {
  createOrder, getMyOrders, getOrderById, updateOrderStatus,
  approveOrder, cancelOrder, getTailorDashboardStats,
} from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getMyOrders);
router.post('/', authorize('customer'), createOrder);
router.get('/tailor/stats', authorize('tailor'), getTailorDashboardStats);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/approve', authorize('customer'), approveOrder);
router.put('/:id/cancel', cancelOrder);

export default router;
