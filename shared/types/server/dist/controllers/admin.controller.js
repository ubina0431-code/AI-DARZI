"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = exports.resolveComplaint = exports.getComplaints = exports.getAdminOrders = exports.getPendingTailors = exports.verifyTailor = exports.reactivateUser = exports.suspendUser = exports.getUsers = exports.getDashboardStats = void 0;
const User_1 = require("../models/User");
const TailorProfile_1 = require("../models/TailorProfile");
const Order_1 = require("../models/Order");
const Review_1 = require("../models/Review");
const Complaint_1 = require("../models/Complaint");
const AuditLog_1 = require("../models/AuditLog");
const notification_service_1 = require("../services/notification.service");
const getDashboardStats = async (req, res) => {
    try {
        const [customers, tailors, verifiedTailors, orders, activeOrders, completedOrders, reviews, complaints] = await Promise.all([
            User_1.User.countDocuments({ role: 'customer', isActive: true }),
            User_1.User.countDocuments({ role: 'tailor', isActive: true }),
            TailorProfile_1.TailorProfile.countDocuments({ isVerified: true }),
            Order_1.Order.countDocuments(),
            Order_1.Order.countDocuments({ status: { $in: ['accepted', 'cutting', 'stitching', 'quality_check'] } }),
            Order_1.Order.countDocuments({ status: 'completed' }),
            Review_1.Review.countDocuments(),
            Complaint_1.Complaint.countDocuments({ status: 'open' }),
        ]);
        // Monthly order trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const orderTrend = await Order_1.Order.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);
        res.json({
            success: true,
            data: {
                customers, tailors, verifiedTailors,
                orders, activeOrders, completedOrders,
                reviews, openComplaints: complaints,
                orderTrend,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' });
    }
};
exports.getDashboardStats = getDashboardStats;
const getUsers = async (req, res) => {
    try {
        const { role, page = '1', limit = '20', search } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const filter = {};
        if (role)
            filter.role = role;
        if (search) {
            filter.$or = [
                { email: new RegExp(search, 'i') },
                { firstName: new RegExp(search, 'i') },
                { lastName: new RegExp(search, 'i') },
            ];
        }
        const [users, total] = await Promise.all([
            User_1.User.find(filter).select('-password').sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
            User_1.User.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: { users, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch users.' });
    }
};
exports.getUsers = getUsers;
const suspendUser = async (req, res) => {
    try {
        const { reason } = req.body;
        const user = await User_1.User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        await AuditLog_1.AuditLog.create({
            userId: req.user.id,
            userRole: 'admin',
            action: 'SUSPEND_USER',
            resource: 'User',
            resourceId: req.params.id,
            metadata: { reason },
            success: true,
        });
        res.json({ success: true, message: 'User suspended.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to suspend user.' });
    }
};
exports.suspendUser = suspendUser;
const reactivateUser = async (req, res) => {
    try {
        await User_1.User.findByIdAndUpdate(req.params.id, { isActive: true });
        res.json({ success: true, message: 'User reactivated.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to reactivate user.' });
    }
};
exports.reactivateUser = reactivateUser;
const verifyTailor = async (req, res) => {
    try {
        const { action } = req.body; // 'verify' | 'reject'
        const profile = await TailorProfile_1.TailorProfile.findById(req.params.id);
        if (!profile) {
            res.status(404).json({ success: false, message: 'Tailor profile not found.' });
            return;
        }
        if (action === 'verify') {
            await TailorProfile_1.TailorProfile.findByIdAndUpdate(req.params.id, {
                isVerified: true,
                verifiedAt: new Date(),
                verifiedBy: req.user.id,
            });
            await notification_service_1.notificationService.create({
                userId: profile.userId.toString(),
                type: 'tailor_verified',
                title: 'Profile Verified! ✅',
                message: 'Congratulations! Your tailor profile has been verified by AI Darzi.',
            });
        }
        else {
            await TailorProfile_1.TailorProfile.findByIdAndUpdate(req.params.id, { isVerified: false });
        }
        await AuditLog_1.AuditLog.create({
            userId: req.user.id,
            userRole: 'admin',
            action: action === 'verify' ? 'VERIFY_TAILOR' : 'REJECT_TAILOR',
            resource: 'TailorProfile',
            resourceId: req.params.id,
            success: true,
        });
        res.json({ success: true, message: `Tailor ${action === 'verify' ? 'verified' : 'rejected'}.` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update tailor verification.' });
    }
};
exports.verifyTailor = verifyTailor;
const getPendingTailors = async (req, res) => {
    try {
        const { page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const [tailors, total] = await Promise.all([
            TailorProfile_1.TailorProfile.find({ isVerified: false })
                .populate('userId', 'firstName lastName email createdAt')
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            TailorProfile_1.TailorProfile.countDocuments({ isVerified: false }),
        ]);
        res.json({
            success: true,
            data: { tailors, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch pending tailors.' });
    }
};
exports.getPendingTailors = getPendingTailors;
const getAdminOrders = async (req, res) => {
    try {
        const { status, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const filter = {};
        if (status)
            filter.status = status;
        const [orders, total] = await Promise.all([
            Order_1.Order.find(filter)
                .populate('customerId', 'firstName lastName email')
                .populate('tailorId', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            Order_1.Order.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: { orders, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
    }
};
exports.getAdminOrders = getAdminOrders;
const getComplaints = async (req, res) => {
    try {
        const { status, page = '1', limit = '20' } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const [complaints, total] = await Promise.all([
            Complaint_1.Complaint.find(filter)
                .populate('reportedBy', 'firstName lastName email')
                .populate('targetUserId', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            Complaint_1.Complaint.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: { complaints, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch complaints.' });
    }
};
exports.getComplaints = getComplaints;
const resolveComplaint = async (req, res) => {
    try {
        const { action, adminNotes } = req.body;
        await Complaint_1.Complaint.findByIdAndUpdate(req.params.id, {
            status: action === 'resolve' ? 'resolved' : 'dismissed',
            adminNotes,
            resolvedBy: req.user.id,
            resolvedAt: new Date(),
        });
        res.json({ success: true, message: 'Complaint updated.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update complaint.' });
    }
};
exports.resolveComplaint = resolveComplaint;
const getAuditLogs = async (req, res) => {
    try {
        const { page = '1', limit = '50' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const [logs, total] = await Promise.all([
            AuditLog_1.AuditLog.find()
                .populate('userId', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            AuditLog_1.AuditLog.countDocuments(),
        ]);
        res.json({
            success: true,
            data: { logs, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
    }
};
exports.getAuditLogs = getAuditLogs;
//# sourceMappingURL=admin.controller.js.map