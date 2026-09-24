import { Router } from 'express';
import {
  getDashboardStats, getUsers, suspendUser, reactivateUser, verifyTailor,
  getPendingTailors, getAdminOrders, getComplaints, resolveComplaint, getAuditLogs,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/reactivate', reactivateUser);
router.get('/tailors/pending', getPendingTailors);
router.put('/tailors/:id/verify', verifyTailor);
router.get('/orders', getAdminOrders);
router.get('/complaints', getComplaints);
router.put('/complaints/:id/resolve', resolveComplaint);
router.get('/audit-logs', getAuditLogs);

export default router;
