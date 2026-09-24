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

export interface ITailorProfile {
  _id: string;
  userId: string;
  businessName: string;
  description?: string;
  gender: 'male' | 'female';
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
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
