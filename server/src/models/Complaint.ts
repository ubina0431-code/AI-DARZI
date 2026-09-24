import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaint extends Document {
  reportedBy: mongoose.Types.ObjectId;
  reportedByRole: string;
  targetUserId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  type: 'harassment' | 'fraud' | 'poor_quality' | 'no_show' | 'payment_issue' | 'other';
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'dismissed';
  adminNotes?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportedByRole: { type: String, required: true },
    targetUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    type: {
      type: String,
      enum: ['harassment', 'fraud', 'poor_quality', 'no_show', 'payment_issue', 'other'],
      required: true,
    },
    description: { type: String, required: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'dismissed'],
      default: 'open',
    },
    adminNotes: String,
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
  },
  { timestamps: true }
);

ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ reportedBy: 1 });
ComplaintSchema.index({ targetUserId: 1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
