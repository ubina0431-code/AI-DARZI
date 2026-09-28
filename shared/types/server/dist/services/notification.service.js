"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditService = exports.notificationService = void 0;
const Notification_1 = require("../models/Notification");
const AuditLog_1 = require("../models/AuditLog");
exports.notificationService = {
    async create(options) {
        try {
            const notification = await Notification_1.Notification.create({
                userId: options.userId,
                type: options.type,
                title: options.title,
                message: options.message,
                data: options.data,
                orderId: options.orderId,
            });
            return notification;
        }
        catch (error) {
            console.error('Failed to create notification:', error);
        }
    },
    async createOrderNotification(userId, orderId, status) {
        const messages = {
            created: { title: 'Order Created', message: 'Your order has been placed successfully.', type: 'order_created' },
            tailor_reviewing: { title: 'Order Under Review', message: 'Your tailor is reviewing your order.', type: 'order_status' },
            price_quoted: { title: 'Price Quote Received', message: 'Your tailor has sent a price quote. Please review.', type: 'quote_received' },
            accepted: { title: 'Order Accepted!', message: 'Great news! Your tailor has accepted your order.', type: 'tailor_accepted' },
            ready: { title: 'Order Ready!', message: 'Your outfit is ready for pickup/delivery!', type: 'order_ready' },
            delivered: { title: 'Order Delivered', message: 'Your order has been delivered. Please leave a review!', type: 'delivery' },
            cancelled: { title: 'Order Cancelled', message: 'Your order has been cancelled.', type: 'order_cancelled' },
        };
        const info = messages[status];
        if (info) {
            await this.create({ userId, type: info.type, title: info.title, message: info.message, orderId });
        }
    },
};
exports.auditService = {
    async log(options) {
        try {
            await AuditLog_1.AuditLog.create({
                userId: options.userId,
                userRole: options.userRole,
                action: options.action,
                resource: options.resource,
                resourceId: options.resourceId,
                metadata: options.metadata,
                ipAddress: options.ipAddress,
                success: options.success !== undefined ? options.success : true,
                errorMessage: options.errorMessage,
            });
        }
        catch (error) {
            console.error('Failed to write audit log:', error);
        }
    },
};
//# sourceMappingURL=notification.service.js.map