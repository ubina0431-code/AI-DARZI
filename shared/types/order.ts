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

export interface IOrder {
  _id: string;
  customerId: string;
  tailorId: string;
  designId?: string;
  measurementProfileId?: string;
  conversationId?: string;
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
