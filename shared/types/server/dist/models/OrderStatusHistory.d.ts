import mongoose, { Document } from 'mongoose';
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
export declare const OrderStatusHistory: mongoose.Model<IOrderStatusHistory, {}, {}, {}, mongoose.Document<unknown, {}, IOrderStatusHistory, {}, {}> & IOrderStatusHistory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=OrderStatusHistory.d.ts.map