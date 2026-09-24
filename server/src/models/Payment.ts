import mongoose, { Document, Schema } from 'mongoose';

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

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'PKR' },
    status: {
      type: String,
      enum: ['pending', 'initiated', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
    },
    provider: { type: String, default: 'manual' },
    providerReference: { type: String },
    providerResponse: { type: Schema.Types.Mixed },
    description: String,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number,
  },
  { timestamps: true }
);

PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ customerId: 1 });
PaymentSchema.index({ status: 1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
