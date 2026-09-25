import mongoose, { Document, Schema } from 'mongoose';

export type MessageType = 'text' | 'design_reference' | 'order_update' | 'image' | 'system';

export interface IChatMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderRole: string;
  content: string;
  type: MessageType;
  attachments: string[];
  designRef?: mongoose.Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatConversation',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: { type: String, required: true },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [2000, 'Message too long'],
    },
    type: {
      type: String,
      enum: ['text', 'design_reference', 'order_update', 'image', 'system'],
      default: 'text',
    },
    attachments: [{ type: String }],
    designRef: { type: Schema.Types.ObjectId, ref: 'Design' },
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ChatMessageSchema.index({ conversationId: 1, createdAt: 1 });
ChatMessageSchema.index({ senderId: 1 });
ChatMessageSchema.index({ conversationId: 1, isRead: 1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
