import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  gender?: 'male' | 'female' | 'prefer_not_to_say';
  dateOfBirth?: Date;
  country: string;
  city?: string;
  address?: string;
  isOverseas: boolean;
  preferredLanguage: string;
  currency: string;
  privacySettings: {
    deleteMeasurementPhotos: boolean;
    shareDataWithTailors: boolean;
    allowReviews: boolean;
  };
  tailorPreferences: {
    genderPreference?: 'female_only' | 'male_only' | 'no_preference';
    hijabFriendly: boolean;
    homeService: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CustomerProfileSchema = new Schema<ICustomerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'prefer_not_to_say'],
    },
    dateOfBirth: { type: Date },
    country: { type: String, default: 'Pakistan' },
    city: { type: String, trim: true },
    address: { type: String },
    isOverseas: { type: Boolean, default: false },
    preferredLanguage: { type: String, default: 'en' },
    currency: { type: String, default: 'PKR' },
    privacySettings: {
      deleteMeasurementPhotos: { type: Boolean, default: true },
      shareDataWithTailors: { type: Boolean, default: true },
      allowReviews: { type: Boolean, default: true },
    },
    tailorPreferences: {
      genderPreference: {
        type: String,
        enum: ['female_only', 'male_only', 'no_preference'],
        default: 'no_preference',
      },
      hijabFriendly: { type: Boolean, default: false },
      homeService: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

CustomerProfileSchema.index({ userId: 1 });
CustomerProfileSchema.index({ country: 1, city: 1 });

export const CustomerProfile = mongoose.model<ICustomerProfile>('CustomerProfile', CustomerProfileSchema);
