import mongoose, { Document, Schema } from 'mongoose';

export interface IChatConversation extends Document {
  orderId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  tailorId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  lastMessage?: string;
  lastMessageAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatConversationSchema = new Schema<IChatConversation>(
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
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: String,
    lastMessageAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ChatConversationSchema.index({ orderId: 1 });
ChatConversationSchema.index({ customerId: 1 });
ChatConversationSchema.index({ tailorId: 1 });
ChatConversationSchema.index({ participants: 1 });

export const ChatConversation = mongoose.model<IChatConversation>('ChatConversation', ChatConversationSchema);
