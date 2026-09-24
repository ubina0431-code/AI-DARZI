import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus =
  | 'created'
  | 'tailor_reviewing'
  | 'price_quoted'
  | 'customer_approval'
  | 'payment_pending'
  | 'accepted'
  | 'measurement_confirmed'
  | 'design_confirmed'
  | 'cutting'
  | 'stitching'
  | 'quality_check'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export const VALID_ORDER_STATUSES: OrderStatus[] = [
  'created', 'tailor_reviewing', 'price_quoted', 'customer_approval',
  'payment_pending', 'accepted', 'measurement_confirmed', 'design_confirmed',
  'cutting', 'stitching', 'quality_check', 'ready', 'out_for_delivery',
  'delivered', 'completed', 'cancelled',
];

// Valid transitions map
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  created: ['tailor_reviewing', 'stitching', 'cancelled'],
  tailor_reviewing: ['price_quoted', 'stitching', 'cancelled'],
  price_quoted: ['customer_approval', 'cancelled'],
  customer_approval: ['payment_pending', 'cancelled'],
  payment_pending: ['accepted', 'cancelled'],
  accepted: ['measurement_confirmed', 'cancelled'],
  measurement_confirmed: ['design_confirmed', 'cancelled'],
  design_confirmed: ['cutting', 'cancelled'],
  cutting: ['stitching'],
  stitching: ['quality_check', 'delivered'],
  quality_check: ['ready', 'stitching'],
  ready: ['out_for_delivery', 'delivered'],
  out_for_delivery: ['delivered'],
  delivered: ['completed'],
  completed: [],
  cancelled: [],
};

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

const OrderSchema = new Schema<IOrder>(
  {
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
    designId: { type: Schema.Types.ObjectId, ref: 'Design' },
    measurementProfileId: { type: Schema.Types.ObjectId, ref: 'MeasurementProfile' },
    conversationId: { type: Schema.Types.ObjectId, ref: 'ChatConversation' },
    status: {
      type: String,
      enum: VALID_ORDER_STATUSES,
      default: 'created',
    },
    title: { type: String, required: true, trim: true },
    description: String,
    specialInstructions: String,
    quotedPrice: { type: Number, min: 0 },
    finalPrice: { type: Number, min: 0 },
    currency: { type: String, default: 'PKR' },
    estimatedCompletionDate: Date,
    actualCompletionDate: Date,
    customerApprovedPrice: { type: Boolean, default: false },
    customerApprovedDesign: { type: Boolean, default: false },
    customerApprovedMeasurements: { type: Boolean, default: false },
    approvalTimestamp: Date,
    isOverseasOrder: { type: Boolean, default: false },
    deliveryAddress: String,
    deliveryCity: String,
    deliveryCountry: String,
    rejectionReason: String,
  },
  { timestamps: true }
);

OrderSchema.index({ customerId: 1, status: 1 });
OrderSchema.index({ tailorId: 1, status: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
