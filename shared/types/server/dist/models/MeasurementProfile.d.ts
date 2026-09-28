import mongoose, { Document } from 'mongoose';
export interface IMeasurements {
    shoulder?: number;
    chest?: number;
    bust?: number;
    waist?: number;
    hip?: number;
    sleeve?: number;
    armhole?: number;
    wrist?: number;
    kameezeLength?: number;
    kurtaLength?: number;
    trouserLength?: number;
    shalwarLength?: number;
    thigh?: number;
    inseam?: number;
    outseam?: number;
    neck?: number;
    custom?: Record<string, number>;
}
export interface IMeasurementProfile extends Document {
    customerId: mongoose.Types.ObjectId;
    gender?: 'male' | 'female';
    garment?: 'kameez' | 'shalwar' | 'suit' | 'waistcoat';
    name: string;
    measurements: IMeasurements;
    unit: 'inches' | 'cm';
    isVerified: boolean;
    verifiedAt?: Date;
    notes?: string;
    aiGenerated: boolean;
    aiSessionId?: mongoose.Types.ObjectId;
    version: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const MeasurementProfile: mongoose.Model<IMeasurementProfile, {}, {}, {}, mongoose.Document<unknown, {}, IMeasurementProfile, {}, {}> & IMeasurementProfile & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=MeasurementProfile.d.ts.map