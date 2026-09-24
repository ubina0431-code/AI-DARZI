import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TailorProfile } from '../models/TailorProfile';
import { User } from '../models/User';
import { Review } from '../models/Review';
import { Favorite } from '../models/Favorite';

export const getTailors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      city, gender, specialty, minRating, maxPrice, isHijabFriendly,
      offersFemaleOnly, offersHomePickup, offersHomeDelivery, isVerified,
      page = '1', limit = '12', sort = 'rating',
    } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = { isAvailable: true };

    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (gender) filter.gender = gender;
    if (specialty) filter.specialties = specialty;
    if (minRating) filter.rating = { $gte: parseFloat(minRating) };
    if (isHijabFriendly === 'true') filter.isHijabFriendly = true;
    if (offersFemaleOnly === 'true') filter.offersFemaleOnly = true;
    if (offersHomePickup === 'true') filter.offersHomePickup = true;
    if (offersHomeDelivery === 'true') filter.offersHomeDelivery = true;
    if (isVerified === 'true') filter.isVerified = true;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      rating: { rating: -1 },
      reviews: { totalReviews: -1 },
      orders: { totalOrders: -1 },
      newest: { createdAt: -1 },
    };
    const sortOption = sortMap[sort] || sortMap.rating;

    const [tailors, total] = await Promise.all([
      TailorProfile.find(filter)
        .populate('userId', 'firstName lastName avatar email')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      TailorProfile.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        tailors,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tailors.' });
  }
};

export const getTailorById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tailor = await TailorProfile.findById(req.params.id)
      .populate('userId', 'firstName lastName avatar email createdAt');

    if (!tailor) {
      res.status(404).json({ success: false, message: 'Tailor not found.' });
      return;
    }

    const reviews = await Review.find({ tailorId: tailor.userId, isApproved: true })
      .populate('customerId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    let isFavorited = false;
    if (req.user) {
      const fav = await Favorite.findOne({ customerId: req.user.id, tailorId: tailor.userId });
      isFavorited = !!fav;
    }

    res.json({ success: true, data: { tailor, reviews, isFavorited } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tailor profile.' });
  }
};

export const updateTailorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await TailorProfile.findOneAndUpdate(
      { userId: req.user!.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!profile) {
      res.status(404).json({ success: false, message: 'Tailor profile not found.' });
      return;
    }
    res.json({ success: true, message: 'Profile updated.', data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

export const getMyTailorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await TailorProfile.findOne({ userId: req.user!.id })
      .populate('userId', 'firstName lastName avatar email phone');
    if (!profile) {
      res.status(404).json({ success: false, message: 'Tailor profile not found.' });
      return;
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tailorProfile = await TailorProfile.findById(req.params.id);
    if (!tailorProfile) {
      res.status(404).json({ success: false, message: 'Tailor not found.' });
      return;
    }

    const existing = await Favorite.findOne({ customerId: req.user!.id, tailorId: tailorProfile.userId });
    if (existing) {
      await existing.deleteOne();
      res.json({ success: true, message: 'Removed from favorites.', data: { isFavorited: false } });
    } else {
      await Favorite.create({ customerId: req.user!.id, tailorId: tailorProfile.userId });
      res.json({ success: true, message: 'Added to favorites.', data: { isFavorited: true } });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update favorites.' });
  }
};

export const getCities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cities = await TailorProfile.distinct('location.city');
    res.json({ success: true, data: cities.filter(Boolean).sort() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch cities.' });
  }
};
