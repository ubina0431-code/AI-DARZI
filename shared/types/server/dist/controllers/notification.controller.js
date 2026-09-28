"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAsRead = exports.getNotifications = void 0;
const Notification_1 = require("../models/Notification");
const getNotifications = async (req, res) => {
    try {
        const { page = '1', limit = '20', unreadOnly } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const filter = { userId: req.user.id };
        if (unreadOnly === 'true')
            filter.isRead = false;
        const [notifications, total, unreadCount] = await Promise.all([
            Notification_1.Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            Notification_1.Notification.countDocuments(filter),
            Notification_1.Notification.countDocuments({ userId: req.user.id, isRead: false }),
        ]);
        res.json({
            success: true,
            data: {
                notifications,
                unreadCount,
                pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        const { ids } = req.body; // array of notification IDs or 'all'
        if (ids === 'all') {
            await Notification_1.Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true, readAt: new Date() });
        }
        else {
            await Notification_1.Notification.updateMany({ _id: { $in: ids }, userId: req.user.id }, { isRead: true, readAt: new Date() });
        }
        res.json({ success: true, message: 'Notifications marked as read.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update notifications.' });
    }
};
exports.markAsRead = markAsRead;
const deleteNotification = async (req, res) => {
    try {
        await Notification_1.Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ success: true, message: 'Notification deleted.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete notification.' });
    }
};
exports.deleteNotification = deleteNotification;
//# sourceMappingURL=notification.controller.js.map