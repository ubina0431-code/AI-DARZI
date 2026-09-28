"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', order_controller_1.getMyOrders);
router.post('/', (0, auth_1.authorize)('customer'), order_controller_1.createOrder);
router.get('/tailor/stats', (0, auth_1.authorize)('tailor'), order_controller_1.getTailorDashboardStats);
router.get('/:id', order_controller_1.getOrderById);
router.put('/:id/status', order_controller_1.updateOrderStatus);
router.put('/:id/approve', (0, auth_1.authorize)('customer'), order_controller_1.approveOrder);
router.put('/:id/cancel', order_controller_1.cancelOrder);
exports.default = router;
//# sourceMappingURL=order.routes.js.map