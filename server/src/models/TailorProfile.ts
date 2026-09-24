import mongoose, { Document, Schema } from 'mongoose';

export type TailorSpecialty =
  | 'bridal' | 'formal' | 'casual' | 'mens_wear' | 'womens_wear'
  | 'kids_wear' | 'embroidery' | 'alterations' | 'western' | 'traditional';

export interface IService {
  name: string;
  description?: string;
  priceMin: number;
  priceMax: number;
  currency: string;
  estimatedDays: number;
}

export interface ITailorProfile extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  description?: string;
  gender: 'male' | 'female';
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  profileImage?: string;
  portfolioImages: string[];
  specialties: TailorSpecialty[];
  services: IService[];
  location: {
    address: string;
    city: string;
    province: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  isAvailable: boolean;
  isHijabFriendly: boolean;
  offersHomePickup: boolean;
  offersHomeDelivery: boolean;
  offersFemaleOnly: boolean;
  experienceYears: number;
  rating: number;
  totalReviews: number;
  totalOrders: number;
  completionRate: number;
  responseTimeHours: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>({
  name: { type: String, required: true },
  description: String,
  priceMin: { type: Number, required: true, min: 0 },
  priceMax: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'PKR' },
  estimatedDays: { type: Number, required: true, min: 1 },
});

const TailorProfileSchema = new Schema<ITailorProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
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
  },
  { timestamps: true }
);

TailorProfileSchema.index({ 'location.city': 1 });
TailorProfileSchema.index({ specialties: 1 });
TailorProfileSchema.index({ isVerified: 1, isAvailable: 1 });
TailorProfileSchema.index({ rating: -1 });
TailorProfileSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });

export const TailorProfile = mongoose.model<ITailorProfile>('TailorProfile', TailorProfileSchema);
