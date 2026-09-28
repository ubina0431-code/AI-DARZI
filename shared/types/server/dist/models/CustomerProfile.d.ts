import mongoose, { Document } from 'mongoose';
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
export declare const CustomerProfile: mongoose.Model<ICustomerProfile, {}, {}, {}, mongoose.Document<unknown, {}, ICustomerProfile, {}, {}> & ICustomerProfile & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=CustomerProfile.d.ts.map