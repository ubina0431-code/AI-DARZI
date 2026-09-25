import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', unreadOnly } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter: Record<string, unknown> = { userId: req.user!.id };
    if (unreadOnly === 'true') filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.user!.id, isRead: false }),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ids } = req.body; // array of notification IDs or 'all'
    if (ids === 'all') {
      await Notification.updateMany({ userId: req.user!.id, isRead: false }, { isRead: true, readAt: new Date() });
    } else {
      await Notification.updateMany(
        { _id: { $in: ids }, userId: req.user!.id },
        { isRead: true, readAt: new Date() }
      );
    }
    res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete notification.' });
  }
};
