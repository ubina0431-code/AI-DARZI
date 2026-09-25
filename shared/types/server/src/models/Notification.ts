import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'registration' | 'order_created' | 'tailor_accepted' | 'quote_received'
  | 'design_approval' | 'measurement_issue' | 'payment' | 'order_status'
  | 'chat_message' | 'order_ready' | 'delivery' | 'review_request'
  | 'tailor_verified' | 'order_cancelled' | 'general';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  orderId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'registration', 'order_created', 'tailor_accepted', 'quote_received',
        'design_approval', 'measurement_issue', 'payment', 'order_status',
        'chat_message', 'order_ready', 'delivery', 'review_request',
        'tailor_verified', 'order_cancelled', 'general',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
    readAt: Date,
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
