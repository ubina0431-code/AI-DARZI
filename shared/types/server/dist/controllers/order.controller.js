"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTailorDashboardStats = exports.cancelOrder = exports.approveOrder = exports.updateOrderStatus = exports.getOrderById = exports.getMyOrders = exports.createOrder = void 0;
const Order_1 = require("../models/Order");
const OrderStatusHistory_1 = require("../models/OrderStatusHistory");
const ChatConversation_1 = require("../models/ChatConversation");
const TailorProfile_1 = require("../models/TailorProfile");
const MeasurementProfile_1 = require("../models/MeasurementProfile");
const Design_1 = require("../models/Design");
const notification_service_1 = require("../services/notification.service");
const createOrder = async (req, res) => {
    try {
        const { tailorProfileId, designId, measurementProfileId, title, description, specialInstructions, isOverseasOrder, deliveryAddress, deliveryCity, deliveryCountry, } = req.body;
        const tailorProfile = await TailorProfile_1.TailorProfile.findById(tailorProfileId);
        if (!tailorProfile) {
            res.status(404).json({ success: false, message: 'Tailor not found.' });
            return;
        }
        // Verify measurement belongs to customer
        if (measurementProfileId) {
            const mp = await MeasurementProfile_1.MeasurementProfile.findOne({ _id: measurementProfileId, customerId: req.user.id });
            if (!mp) {
                res.status(400).json({ success: false, message: 'Measurement profile not found.' });
                return;
            }
        }
        // Verify design belongs to customer
        if (designId) {
            const design = await Design_1.Design.findOne({ _id: designId, customerId: req.user.id });
            if (!design) {
                res.status(400).json({ success: false, message: 'Design not found.' });
                return;
            }
            await Design_1.Design.findByIdAndUpdate(designId, { status: 'sent_to_tailor' });
        }
        const order = await Order_1.Order.create({
            customerId: req.user.id,
            tailorId: tailorProfile.userId,
            designId,
            measurementProfileId,
            title,
            description,
            specialInstructions,
            status: 'created',
            isOverseasOrder: isOverseasOrder || false,
            deliveryAddress,
            deliveryCity,
            deliveryCountry,
        });
        // Create chat conversation
        const conversation = await ChatConversation_1.ChatConversation.create({
            orderId: order._id,
            customerId: req.user.id,
            tailorId: tailorProfile.userId,
            participants: [req.user.id, tailorProfile.userId],
        });
        await Order_1.Order.findByIdAndUpdate(order._id, { conversationId: conversation._id });
        // Record status history
        await OrderStatusHistory_1.OrderStatusHistory.create({
            orderId: order._id,
            toStatus: 'created',
            changedBy: req.user.id,
            changedByRole: 'customer',
            note: 'Order created',
        });
        // Notify tailor
        await notification_service_1.notificationService.create({
            userId: tailorProfile.userId.toString(),
            type: 'order_created',
            title: 'New Order Received!',
            message: `You have a new order: "${title}"`,
            orderId: order._id.toString(),
        });
        // Notify customer
        await notification_service_1.notificationService.createOrderNotification(req.user.id, order._id.toString(), 'created');
        const populated = await Order_1.Order.findById(order._id)
            .populate('customerId', 'firstName lastName email avatar')
            .populate('tailorId', 'firstName lastName avatar')
            .populate('designId')
            .populate('measurementProfileId');
        res.status(201).json({ success: true, message: 'Order placed successfully!', data: populated });
    }
    catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: 'Failed to create order.' });
    }
};
exports.createOrder = createOrder;
const getMyOrders = async (req, res) => {
    try {
        const { status, page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const filter = {};
        if (req.user.role === 'customer')
            filter.customerId = req.user.id;
        else if (req.user.role === 'tailor')
            filter.tailorId = req.user.id;
        if (status)
            filter.status = status;
        const [orders, total] = await Promise.all([
            Order_1.Order.find(filter)
                .populate('customerId', 'firstName lastName avatar email')
                .populate('tailorId', 'firstName lastName avatar')
                .populate('designId', 'title specification thumbnailUrl')
                .populate('measurementProfileId', 'name measurements unit')
                .sort({ updatedAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            Order_1.Order.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: {
                orders,
                pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
    }
};
exports.getMyOrders = getMyOrders;
const getOrderById = async (req, res) => {
    try {
        const filter = { _id: req.params.id };
        if (req.user.role === 'customer')
            filter.customerId = req.user.id;
        else if (req.user.role === 'tailor')
            filter.tailorId = req.user.id;
        const order = await Order_1.Order.findOne(filter)
            .populate('customerId', 'firstName lastName avatar email phone')
            .populate('tailorId', 'firstName lastName avatar')
            .populate('designId')
            .populate('measurementProfileId');
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found.' });
            return;
        }
        const statusHistory = await OrderStatusHistory_1.OrderStatusHistory.find({ orderId: order._id })
            .populate('changedBy', 'firstName lastName')
            .sort({ createdAt: 1 });
        res.json({ success: true, data: { order, statusHistory } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch order.' });
    }
};
exports.getOrderById = getOrderById;
const updateOrderStatus = async (req, res) => {
    try {
        const { status, note, quotedPrice, estimatedCompletionDate, rejectionReason } = req.body;
        const order = await Order_1.Order.findById(req.params.id);
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found.' });
            return;
        }
        // Validate permissions
        const isTailor = req.user.role === 'tailor' && order.tailorId.toString() === req.user.id;
        const isCustomer = req.user.role === 'customer' && order.customerId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isTailor && !isCustomer && !isAdmin) {
            res.status(403).json({ success: false, message: 'Not authorized to update this order.' });
            return;
        }
        // Validate status transition
        const allowedNext = Order_1.ORDER_STATUS_TRANSITIONS[order.status] || [];
        if (!allowedNext.includes(status)) {
            res.status(400).json({
                success: false,
                message: `Invalid status transition from "${order.status}" to "${status}".`,
                allowedTransitions: allowedNext,
            });
            return;
        }
        const updates = { status };
        if (quotedPrice !== undefined)
            updates.quotedPrice = quotedPrice;
        if (estimatedCompletionDate)
            updates.estimatedCompletionDate = new Date(estimatedCompletionDate);
        if (rejectionReason)
            updates.rejectionReason = rejectionReason;
        if (status === 'completed')
            updates.actualCompletionDate = new Date();
        await Order_1.Order.findByIdAndUpdate(order._id, updates);
        await OrderStatusHistory_1.OrderStatusHistory.create({
            orderId: order._id,
            fromStatus: order.status,
            toStatus: status,
            changedBy: req.user.id,
            changedByRole: req.user.role,
            note,
        });
        // Notify the other party
        const notifyUserId = isTailor ? order.customerId.toString() : order.tailorId.toString();
        await notification_service_1.notificationService.createOrderNotification(notifyUserId, order._id.toString(), status);
        const updated = await Order_1.Order.findById(order._id)
            .populate('customerId', 'firstName lastName avatar')
            .populate('tailorId', 'firstName lastName avatar');
        res.json({ success: true, message: `Order status updated to "${status}".`, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update order status.' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
const approveOrder = async (req, res) => {
    try {
        const { approvePrice, approveDesign, approveMeasurements } = req.body;
        const order = await Order_1.Order.findOne({ _id: req.params.id, customerId: req.user.id });
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found.' });
            return;
        }
        const updates = {};
        if (approvePrice !== undefined)
            updates.customerApprovedPrice = approvePrice;
        if (approveDesign !== undefined)
            updates.customerApprovedDesign = approveDesign;
        if (approveMeasurements !== undefined)
            updates.customerApprovedMeasurements = approveMeasurements;
        updates.approvalTimestamp = new Date();
        if (approvePrice && order.status === 'price_quoted') {
            updates.status = 'customer_approval';
            await OrderStatusHistory_1.OrderStatusHistory.create({
                orderId: order._id,
                fromStatus: order.status,
                toStatus: 'customer_approval',
                changedBy: req.user.id,
                changedByRole: 'customer',
                note: 'Customer approved quote',
            });
        }
        await Order_1.Order.findByIdAndUpdate(order._id, updates);
        await notification_service_1.notificationService.create({
            userId: order.tailorId.toString(),
            type: 'design_approval',
            title: 'Customer Approved Order',
            message: 'The customer has approved the order details.',
            orderId: order._id.toString(),
        });
        res.json({ success: true, message: 'Order approved successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to approve order.' });
    }
};
exports.approveOrder = approveOrder;
const cancelOrder = async (req, res) => {
    try {
        const { reason } = req.body;
        const order = await Order_1.Order.findById(req.params.id);
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found.' });
            return;
        }
        const canCancel = ['created', 'tailor_reviewing', 'price_quoted', 'customer_approval', 'payment_pending'].includes(order.status);
        if (!canCancel) {
            res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage.' });
            return;
        }
        await Order_1.Order.findByIdAndUpdate(order._id, { status: 'cancelled', rejectionReason: reason });
        await OrderStatusHistory_1.OrderStatusHistory.create({
            orderId: order._id,
            fromStatus: order.status,
            toStatus: 'cancelled',
            changedBy: req.user.id,
            changedByRole: req.user.role,
            note: reason || 'Order cancelled',
        });
        const notifyId = req.user.role === 'customer' ? order.tailorId.toString() : order.customerId.toString();
        await notification_service_1.notificationService.createOrderNotification(notifyId, order._id.toString(), 'cancelled');
        res.json({ success: true, message: 'Order cancelled.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to cancel order.' });
    }
};
exports.cancelOrder = cancelOrder;
const getTailorDashboardStats = async (req, res) => {
    try {
        const tailorId = req.user.id;
        const [total, active, pending, completed, earnings] = await Promise.all([
            Order_1.Order.countDocuments({ tailorId }),
            Order_1.Order.countDocuments({ tailorId, status: { $in: ['accepted', 'cutting', 'stitching', 'quality_check'] } }),
            Order_1.Order.countDocuments({ tailorId, status: { $in: ['created', 'tailor_reviewing', 'price_quoted'] } }),
            Order_1.Order.countDocuments({ tailorId, status: 'completed' }),
            Order_1.Order.aggregate([
                { $match: { tailorId: req.user.id, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$finalPrice' } } },
            ]),
        ]);
        res.json({
            success: true,
            data: {
                totalOrders: total,
                activeOrders: active,
                pendingReview: pending,
                completedOrders: completed,
                totalEarnings: earnings[0]?.total || 0,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats.' });
    }
};
exports.getTailorDashboardStats = getTailorDashboardStats;
//# sourceMappingURL=order.controller.js.map