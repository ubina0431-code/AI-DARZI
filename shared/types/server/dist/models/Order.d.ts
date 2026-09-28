import mongoose, { Document } from 'mongoose';
export type OrderStatus = 'created' | 'tailor_reviewing' | 'price_quoted' | 'customer_approval' | 'payment_pending' | 'accepted' | 'measurement_confirmed' | 'design_confirmed' | 'cutting' | 'stitching' | 'quality_check' | 'ready' | 'out_for_delivery' | 'delivered' | 'completed' | 'cancelled';
export declare const VALID_ORDER_STATUSES: OrderStatus[];
export declare const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]>;
export interface IOrder extends Document {
    customerId: mongoose.Types.ObjectId;
    tailorId: mongoose.Types.ObjectId;
    designId?: mongoose.Types.ObjectId;
    measurementProfileId?: mongoose.Types.ObjectId;
    conversationId?: mongoose.Types.ObjectId;
    status: OrderStatus;
    title: string;
    description?: string;
    specialInstructions?: string;
    quotedPrice?: number;
    finalPrice?: number;
    currency: string;
    estimatedCompletionDate?: Date;
    actualCompletionDate?: Date;
    customerApprovedPrice: boolean;
    customerApprovedDesign: boolean;
    customerApprovedMeasurements: boolean;
    approvalTimestamp?: Date;
    isOverseasOrder: boolean;
    deliveryAddress?: string;
    deliveryCity?: string;
    deliveryCountry?: string;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Order: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Order.d.ts.map