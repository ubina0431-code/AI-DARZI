import mongoose, { Document, Schema } from 'mongoose';

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

const ReviewSchema = new Schema<IReview>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tailorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: { type: String, maxlength: 1000 },
    tags: [{ type: String }],
    isPublic: { type: Boolean, default: true },
    tailorResponse: { type: String, maxlength: 500 },
    tailorRespondedAt: Date,
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ tailorId: 1, isApproved: 1 });
ReviewSchema.index({ customerId: 1 });
ReviewSchema.index({ rating: -1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
