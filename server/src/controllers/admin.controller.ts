import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { TailorProfile } from '../models/TailorProfile';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { Complaint } from '../models/Complaint';
import { AuditLog } from '../models/AuditLog';
import { Design } from '../models/Design';
import { notificationService } from '../services/notification.service';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [customers, tailors, verifiedTailors, orders, activeOrders, completedOrders, reviews, complaints] = await Promise.all([
      User.countDocuments({ role: 'customer', isActive: true }),
      User.countDocuments({ role: 'tailor', isActive: true }),
      TailorProfile.countDocuments({ isVerified: true }),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['accepted', 'cutting', 'stitching', 'quality_check'] } }),
      Order.countDocuments({ status: 'completed' }),
      Review.countDocuments(),
      Complaint.countDocuments({ status: 'open' }),
    ]);

    // Monthly order trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orderTrend = await Order.aggregate([
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, page = '1', limit = '20', search } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { email: new RegExp(search, 'i') },
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { users, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

export const suspendUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    await AuditLog.create({
      userId: req.user!.id,
      userRole: 'admin',
      action: 'SUSPEND_USER',
      resource: 'User',
      resourceId: req.params.id,
      metadata: { reason },
      success: true,
    });
    res.json({ success: true, message: 'User suspended.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to suspend user.' });
  }
};

export const reactivateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: true });
    res.json({ success: true, message: 'User reactivated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reactivate user.' });
  }
};

export const verifyTailor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action } = req.body; // 'verify' | 'reject'
    const profile = await TailorProfile.findById(req.params.id);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Tailor profile not found.' });
      return;
    }

    if (action === 'verify') {
      await TailorProfile.findByIdAndUpdate(req.params.id, {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: req.user!.id,
      });
      await notificationService.create({
        userId: profile.userId.toString(),
        type: 'tailor_verified',
        title: 'Profile Verified! ✅',
        message: 'Congratulations! Your tailor profile has been verified by AI Darzi.',
      });
    } else {
      await TailorProfile.findByIdAndUpdate(req.params.id, { isVerified: false });
    }

    await AuditLog.create({
      userId: req.user!.id,
      userRole: 'admin',
      action: action === 'verify' ? 'VERIFY_TAILOR' : 'REJECT_TAILOR',
      resource: 'TailorProfile',
      resourceId: req.params.id,
      success: true,
    });

    res.json({ success: true, message: `Tailor ${action === 'verify' ? 'verified' : 'rejected'}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update tailor verification.' });
  }
};

export const getPendingTailors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [tailors, total] = await Promise.all([
      TailorProfile.find({ isVerified: false })
        .populate('userId', 'firstName lastName email createdAt')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      TailorProfile.countDocuments({ isVerified: false }),
    ]);

    res.json({
      success: true,
      data: { tailors, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending tailors.' });
  }
};

export const getAdminOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customerId', 'firstName lastName email')
        .populate('tailorId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { orders, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

export const getComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate('reportedBy', 'firstName lastName email')
        .populate('targetUserId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Complaint.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { complaints, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch complaints.' });
  }
};

export const resolveComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, adminNotes } = req.body;
    await Complaint.findByIdAndUpdate(req.params.id, {
      status: action === 'resolve' ? 'resolved' : 'dismissed',
      adminNotes,
      resolvedBy: req.user!.id,
      resolvedAt: new Date(),
    });
    res.json({ success: true, message: 'Complaint updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update complaint.' });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '50' } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      AuditLog.countDocuments(),
    ]);

    res.json({
      success: true,
      data: { logs, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
};
