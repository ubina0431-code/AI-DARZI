import mongoose, { Document } from 'mongoose';
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
export declare const ChatMessage: mongoose.Model<IChatMessage, {}, {}, {}, mongoose.Document<unknown, {}, IChatMessage, {}, {}> & IChatMessage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ChatMessage.d.ts.map