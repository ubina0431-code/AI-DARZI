import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Review } from '../models/Review';
import { Order } from '../models/Order';
import { TailorProfile } from '../models/TailorProfile';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId, rating, comment, tags } = req.body;

    const order = await Order.findOne({ _id: orderId, customerId: req.user!.id, status: 'completed' });
    if (!order) {
      res.status(400).json({ success: false, message: 'Order not found or not yet completed.' });
      return;
    }

    const existing = await Review.findOne({ orderId });
    if (existing) {
      res.status(400).json({ success: false, message: 'Review already submitted for this order.' });
      return;
    }

    const review = await Review.create({
      orderId,
      customerId: req.user!.id,
      tailorId: order.tailorId,
      rating,
      comment,
      tags: tags || [],
    });

    // Update tailor's aggregate rating
    const allReviews = await Review.find({ tailorId: order.tailorId, isApproved: true });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await TailorProfile.findOneAndUpdate(
      { userId: order.tailorId },
      { rating: Math.round(avgRating * 10) / 10, totalReviews: allReviews.length }
    );

    res.status(201).json({ success: true, message: 'Review submitted. Thank you!', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};

export const getTailorReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10' } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const tailorProfile = await TailorProfile.findById(req.params.tailorId);
    if (!tailorProfile) {
      res.status(404).json({ success: false, message: 'Tailor not found.' });
      return;
    }

    const [reviews, total] = await Promise.all([
      Review.find({ tailorId: tailorProfile.userId, isApproved: true })
        .populate('customerId', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Review.countDocuments({ tailorId: tailorProfile.userId, isApproved: true }),
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
};

export const respondToReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { response } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    // Verify tailor owns this review
    const profile = await TailorProfile.findOne({ userId: req.user!.id });
    if (!profile || review.tailorId.toString() !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Not authorized.' });
      return;
    }

    await Review.findByIdAndUpdate(req.params.id, {
      tailorResponse: response,
      tailorRespondedAt: new Date(),
    });

    res.json({ success: true, message: 'Response added.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to respond to review.' });
  }
};
