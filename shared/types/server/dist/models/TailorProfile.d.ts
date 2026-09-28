import mongoose, { Document } from 'mongoose';
export type TailorSpecialty = 'bridal' | 'formal' | 'casual' | 'mens_wear' | 'womens_wear' | 'kids_wear' | 'embroidery' | 'alterations' | 'western' | 'traditional';
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
export declare const TailorProfile: mongoose.Model<ITailorProfile, {}, {}, {}, mongoose.Document<unknown, {}, ITailorProfile, {}, {}> & ITailorProfile & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=TailorProfile.d.ts.map