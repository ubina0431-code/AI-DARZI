"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', notification_controller_1.getNotifications);
router.put('/read', notification_controller_1.markAsRead);
router.delete('/:id', notification_controller_1.deleteNotification);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map