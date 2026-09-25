import mongoose, { Document, Schema } from 'mongoose';
import { OrderStatus } from './Order';

export interface IOrderStatusHistory extends Document {
  orderId: mongoose.Types.ObjectId;
  fromStatus?: OrderStatus;
  toStatus: OrderStatus;
  changedBy: mongoose.Types.ObjectId;
  changedByRole: string;
  note?: string;
  createdAt: Date;
}

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    fromStatus: { type: String },
    toStatus: { type: String, required: true },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changedByRole: { type: String, required: true },
    note: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

OrderStatusHistorySchema.index({ orderId: 1 });
OrderStatusHistorySchema.index({ orderId: 1, createdAt: 1 });

export const OrderStatusHistory = mongoose.model<IOrderStatusHistory>('OrderStatusHistory', OrderStatusHistorySchema);
