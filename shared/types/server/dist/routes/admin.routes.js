"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)('admin'));
router.get('/dashboard', admin_controller_1.getDashboardStats);
router.get('/users', admin_controller_1.getUsers);
router.put('/users/:id/suspend', admin_controller_1.suspendUser);
router.put('/users/:id/reactivate', admin_controller_1.reactivateUser);
router.get('/tailors/pending', admin_controller_1.getPendingTailors);
router.put('/tailors/:id/verify', admin_controller_1.verifyTailor);
router.get('/orders', admin_controller_1.getAdminOrders);
router.get('/complaints', admin_controller_1.getComplaints);
router.put('/complaints/:id/resolve', admin_controller_1.resolveComplaint);
router.get('/audit-logs', admin_controller_1.getAuditLogs);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map