import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Order, ORDER_STATUS_TRANSITIONS, OrderStatus } from '../models/Order';
import { OrderStatusHistory } from '../models/OrderStatusHistory';
import { ChatConversation } from '../models/ChatConversation';
import { TailorProfile } from '../models/TailorProfile';
import { MeasurementProfile } from '../models/MeasurementProfile';
import { Design } from '../models/Design';
import { notificationService } from '../services/notification.service';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      tailorProfileId, designId, measurementProfileId,
      title, description, specialInstructions,
      isOverseasOrder, deliveryAddress, deliveryCity, deliveryCountry,
    } = req.body;

    const tailorProfile = await TailorProfile.findById(tailorProfileId);
    if (!tailorProfile) {
      res.status(404).json({ success: false, message: 'Tailor not found.' });
      return;
    }

    // Verify measurement belongs to customer
    if (measurementProfileId) {
      const mp = await MeasurementProfile.findOne({ _id: measurementProfileId, customerId: req.user!.id });
      if (!mp) {
        res.status(400).json({ success: false, message: 'Measurement profile not found.' });
        return;
      }
    }

    // Verify design belongs to customer
    if (designId) {
      const design = await Design.findOne({ _id: designId, customerId: req.user!.id });
      if (!design) {
        res.status(400).json({ success: false, message: 'Design not found.' });
        return;
      }
      await Design.findByIdAndUpdate(designId, { status: 'sent_to_tailor' });
    }

    const order = await Order.create({
      customerId: req.user!.id,
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
    const conversation = await ChatConversation.create({
      orderId: order._id,
      customerId: req.user!.id,
      tailorId: tailorProfile.userId,
      participants: [req.user!.id, tailorProfile.userId],
    });

    await Order.findByIdAndUpdate(order._id, { conversationId: conversation._id });

    // Record status history
    await OrderStatusHistory.create({
      orderId: order._id,
      toStatus: 'created',
      changedBy: req.user!.id,
      changedByRole: 'customer',
      note: 'Order created',
    });

    // Notify tailor
    await notificationService.create({
      userId: tailorProfile.userId.toString(),
      type: 'order_created',
      title: 'New Order Received!',
      message: `You have a new order: "${title}"`,
      orderId: order._id.toString(),
    });

    // Notify customer
    await notificationService.createOrderNotification(req.user!.id, order._id.toString(), 'created');

    const populated = await Order.findById(order._id)
      .populate('customerId', 'firstName lastName email avatar')
      .populate('tailorId', 'firstName lastName avatar')
      .populate('designId')
      .populate('measurementProfileId');

    res.status(201).json({ success: true, message: 'Order placed successfully!', data: populated });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order.' });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '10' } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter: Record<string, unknown> = {};
    if (req.user!.role === 'customer') filter.customerId = req.user!.id;
    else if (req.user!.role === 'tailor') filter.tailorId = req.user!.id;
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customerId', 'firstName lastName avatar email')
        .populate('tailorId', 'firstName lastName avatar')
        .populate('designId', 'title specification thumbnailUrl')
        .populate('measurementProfileId', 'name measurements unit')
        .sort({ updatedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: Record<string, unknown> = { _id: req.params.id };
    if (req.user!.role === 'customer') filter.customerId = req.user!.id;
    else if (req.user!.role === 'tailor') filter.tailorId = req.user!.id;

    const order = await Order.findOne(filter)
      .populate('customerId', 'firstName lastName avatar email phone')
      .populate('tailorId', 'firstName lastName avatar')
      .populate('designId')
      .populate('measurementProfileId');

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    const statusHistory = await OrderStatusHistory.find({ orderId: order._id })
      .populate('changedBy', 'firstName lastName')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: { order, statusHistory } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, note, quotedPrice, estimatedCompletionDate, rejectionReason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    // Validate permissions
    const isTailor = req.user!.role === 'tailor' && order.tailorId.toString() === req.user!.id;
    const isCustomer = req.user!.role === 'customer' && order.customerId.toString() === req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    if (!isTailor && !isCustomer && !isAdmin) {
      res.status(403).json({ success: false, message: 'Not authorized to update this order.' });
      return;
    }

    // Validate status transition
    const allowedNext = ORDER_STATUS_TRANSITIONS[order.status as OrderStatus] || [];
    if (!allowedNext.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status transition from "${order.status}" to "${status}".`,
        allowedTransitions: allowedNext,
      });
      return;
    }

    const updates: Record<string, unknown> = { status };
    if (quotedPrice !== undefined) updates.quotedPrice = quotedPrice;
    if (estimatedCompletionDate) updates.estimatedCompletionDate = new Date(estimatedCompletionDate);
    if (rejectionReason) updates.rejectionReason = rejectionReason;
    if (status === 'completed') updates.actualCompletionDate = new Date();

    await Order.findByIdAndUpdate(order._id, updates);

    await OrderStatusHistory.create({
      orderId: order._id,
      fromStatus: order.status,
      toStatus: status,
      changedBy: req.user!.id,
      changedByRole: req.user!.role,
      note,
    });

    // Notify the other party
    const notifyUserId = isTailor ? order.customerId.toString() : order.tailorId.toString();
    await notificationService.createOrderNotification(notifyUserId, order._id.toString(), status);

    const updated = await Order.findById(order._id)
      .populate('customerId', 'firstName lastName avatar')
      .populate('tailorId', 'firstName lastName avatar');

    res.json({ success: true, message: `Order status updated to "${status}".`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};

export const approveOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { approvePrice, approveDesign, approveMeasurements } = req.body;
    const order = await Order.findOne({ _id: req.params.id, customerId: req.user!.id });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    const updates: Record<string, unknown> = {};
    if (approvePrice !== undefined) updates.customerApprovedPrice = approvePrice;
    if (approveDesign !== undefined) updates.customerApprovedDesign = approveDesign;
    if (approveMeasurements !== undefined) updates.customerApprovedMeasurements = approveMeasurements;
    updates.approvalTimestamp = new Date();

    if (approvePrice && order.status === 'price_quoted') {
      updates.status = 'customer_approval';
      await OrderStatusHistory.create({
        orderId: order._id,
        fromStatus: order.status,
        toStatus: 'customer_approval',
        changedBy: req.user!.id,
        changedByRole: 'customer',
        note: 'Customer approved quote',
      });
    }

    await Order.findByIdAndUpdate(order._id, updates);

    await notificationService.create({
      userId: order.tailorId.toString(),
      type: 'design_approval',
      title: 'Customer Approved Order',
      message: 'The customer has approved the order details.',
      orderId: order._id.toString(),
    });

    res.json({ success: true, message: 'Order approved successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve order.' });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    const canCancel = ['created', 'tailor_reviewing', 'price_quoted', 'customer_approval', 'payment_pending'].includes(order.status);
    if (!canCancel) {
      res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage.' });
      return;
    }

    await Order.findByIdAndUpdate(order._id, { status: 'cancelled', rejectionReason: reason });
    await OrderStatusHistory.create({
      orderId: order._id,
      fromStatus: order.status,
      toStatus: 'cancelled',
      changedBy: req.user!.id,
      changedByRole: req.user!.role,
      note: reason || 'Order cancelled',
    });

    const notifyId = req.user!.role === 'customer' ? order.tailorId.toString() : order.customerId.toString();
    await notificationService.createOrderNotification(notifyId, order._id.toString(), 'cancelled');

    res.json({ success: true, message: 'Order cancelled.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel order.' });
  }
};

export const getTailorDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tailorId = req.user!.id;
    const [total, active, pending, completed, earnings] = await Promise.all([
      Order.countDocuments({ tailorId }),
      Order.countDocuments({ tailorId, status: { $in: ['accepted', 'cutting', 'stitching', 'quality_check'] } }),
      Order.countDocuments({ tailorId, status: { $in: ['created', 'tailor_reviewing', 'price_quoted'] } }),
      Order.countDocuments({ tailorId, status: 'completed' }),
      Order.aggregate([
        { $match: { tailorId: req.user!.id, status: 'completed' } },
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats.' });
  }
};
