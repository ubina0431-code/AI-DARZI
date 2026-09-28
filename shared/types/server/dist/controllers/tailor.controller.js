"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCities = exports.toggleFavorite = exports.getMyTailorProfile = exports.updateTailorProfile = exports.getTailorById = exports.getTailors = void 0;
const TailorProfile_1 = require("../models/TailorProfile");
const Review_1 = require("../models/Review");
const Favorite_1 = require("../models/Favorite");
const getTailors = async (req, res) => {
    try {
        const { city, gender, specialty, minRating, maxPrice, isHijabFriendly, offersFemaleOnly, offersHomePickup, offersHomeDelivery, isVerified, page = '1', limit = '12', sort = 'rating', } = req.query;
        const filter = { isAvailable: true };
        if (city)
            filter['location.city'] = new RegExp(city, 'i');
        if (gender)
            filter.gender = gender;
        if (specialty)
            filter.specialties = specialty;
        if (minRating)
            filter.rating = { $gte: parseFloat(minRating) };
        if (isHijabFriendly === 'true')
            filter.isHijabFriendly = true;
        if (offersFemaleOnly === 'true')
            filter.offersFemaleOnly = true;
        if (offersHomePickup === 'true')
            filter.offersHomePickup = true;
        if (offersHomeDelivery === 'true')
            filter.offersHomeDelivery = true;
        if (isVerified === 'true')
            filter.isVerified = true;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const sortMap = {
            rating: { rating: -1 },
            reviews: { totalReviews: -1 },
            orders: { totalOrders: -1 },
            newest: { createdAt: -1 },
        };
        const sortOption = sortMap[sort] || sortMap.rating;
        const [tailors, total] = await Promise.all([
            TailorProfile_1.TailorProfile.find(filter)
                .populate('userId', 'firstName lastName avatar email')
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum),
            TailorProfile_1.TailorProfile.countDocuments(filter),
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch tailors.' });
    }
};
exports.getTailors = getTailors;
const getTailorById = async (req, res) => {
    try {
        const tailor = await TailorProfile_1.TailorProfile.findById(req.params.id)
            .populate('userId', 'firstName lastName avatar email createdAt');
        if (!tailor) {
            res.status(404).json({ success: false, message: 'Tailor not found.' });
            return;
        }
        const reviews = await Review_1.Review.find({ tailorId: tailor.userId, isApproved: true })
            .populate('customerId', 'firstName lastName avatar')
            .sort({ createdAt: -1 })
            .limit(10);
        let isFavorited = false;
        if (req.user) {
            const fav = await Favorite_1.Favorite.findOne({ customerId: req.user.id, tailorId: tailor.userId });
            isFavorited = !!fav;
        }
        res.json({ success: true, data: { tailor, reviews, isFavorited } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch tailor profile.' });
    }
};
exports.getTailorById = getTailorById;
const updateTailorProfile = async (req, res) => {
    try {
        const profile = await TailorProfile_1.TailorProfile.findOneAndUpdate({ userId: req.user.id }, req.body, { new: true, runValidators: true });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Tailor profile not found.' });
            return;
        }
        res.json({ success: true, message: 'Profile updated.', data: profile });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
};
exports.updateTailorProfile = updateTailorProfile;
const getMyTailorProfile = async (req, res) => {
    try {
        const profile = await TailorProfile_1.TailorProfile.findOne({ userId: req.user.id })
            .populate('userId', 'firstName lastName avatar email phone');
        if (!profile) {
            res.status(404).json({ success: false, message: 'Tailor profile not found.' });
            return;
        }
        res.json({ success: true, data: profile });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
    }
};
exports.getMyTailorProfile = getMyTailorProfile;
const toggleFavorite = async (req, res) => {
    try {
        const tailorProfile = await TailorProfile_1.TailorProfile.findById(req.params.id);
        if (!tailorProfile) {
            res.status(404).json({ success: false, message: 'Tailor not found.' });
            return;
        }
        const existing = await Favorite_1.Favorite.findOne({ customerId: req.user.id, tailorId: tailorProfile.userId });
        if (existing) {
            await existing.deleteOne();
            res.json({ success: true, message: 'Removed from favorites.', data: { isFavorited: false } });
        }
        else {
            await Favorite_1.Favorite.create({ customerId: req.user.id, tailorId: tailorProfile.userId });
            res.json({ success: true, message: 'Added to favorites.', data: { isFavorited: true } });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update favorites.' });
    }
};
exports.toggleFavorite = toggleFavorite;
const getCities = async (req, res) => {
    try {
        const cities = await TailorProfile_1.TailorProfile.distinct('location.city');
        res.json({ success: true, data: cities.filter(Boolean).sort() });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch cities.' });
    }
};
exports.getCities = getCities;
//# sourceMappingURL=tailor.controller.js.map