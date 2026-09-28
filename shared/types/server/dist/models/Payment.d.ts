import mongoose, { Document } from 'mongoose';
export type PaymentStatus = 'pending' | 'initiated' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export interface IPayment extends Document {
    orderId: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;
    amount: number;
    currency: string;
    status: PaymentStatus;
    provider: string;
    providerReference?: string;
    providerResponse?: Record<string, unknown>;
    description?: string;
    paidAt?: Date;
    refundedAt?: Date;
    refundAmount?: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Payment: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment, {}, {}> & IPayment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Payment.d.ts.map