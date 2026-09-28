"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TailorProfile = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ServiceSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: String,
    priceMin: { type: Number, required: true, min: 0 },
    priceMax: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'PKR' },
    estimatedDays: { type: Number, required: true, min: 1 },
});
const TailorProfileSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    businessName: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true,
    },
    description: String,
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true,
    },
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    verifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    profileImage: String,
    portfolioImages: [{ type: String }],
    specialties: [
        {
            type: String,
            enum: ['bridal', 'formal', 'casual', 'mens_wear', 'womens_wear', 'kids_wear', 'embroidery', 'alterations', 'western', 'traditional'],
        },
    ],
    services: [ServiceSchema],
    location: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        province: { type: String, default: '' },
        country: { type: String, default: 'Pakistan' },
        coordinates: {
            lat: Number,
            lng: Number,
        },
    },
    workingHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '18:00' },
        days: [{ type: String }],
    },
    isAvailable: { type: Boolean, default: true },
    isHijabFriendly: { type: Boolean, default: false },
    offersHomePickup: { type: Boolean, default: false },
    offersHomeDelivery: { type: Boolean, default: false },
    offersFemaleOnly: { type: Boolean, default: false },
    experienceYears: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    completionRate: { type: Number, default: 100, min: 0, max: 100 },
    responseTimeHours: { type: Number, default: 24 },
}, { timestamps: true });
TailorProfileSchema.index({ 'location.city': 1 });
TailorProfileSchema.index({ specialties: 1 });
TailorProfileSchema.index({ isVerified: 1, isAvailable: 1 });
TailorProfileSchema.index({ rating: -1 });
TailorProfileSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });
exports.TailorProfile = mongoose_1.default.model('TailorProfile', TailorProfileSchema);
//# sourceMappingURL=TailorProfile.js.map