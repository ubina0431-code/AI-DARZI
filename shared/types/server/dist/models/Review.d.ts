import mongoose, { Document } from 'mongoose';
export interface IReview extends Document {
    orderId: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;
    tailorId: mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
    tags: string[];
    isPublic: boolean;
    tailorResponse?: string;
    tailorRespondedAt?: Date;
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Review: mongoose.Model<IReview, {}, {}, {}, mongoose.Document<unknown, {}, IReview, {}, {}> & IReview & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Review.d.ts.map