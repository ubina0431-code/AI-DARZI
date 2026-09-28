import mongoose, { Document } from 'mongoose';
export type NotificationType = 'registration' | 'order_created' | 'tailor_accepted' | 'quote_received' | 'design_approval' | 'measurement_issue' | 'payment' | 'order_status' | 'chat_message' | 'order_ready' | 'delivery' | 'review_request' | 'tailor_verified' | 'order_cancelled' | 'general';
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
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Notification.d.ts.map