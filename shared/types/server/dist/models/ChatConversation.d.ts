import mongoose, { Document } from 'mongoose';
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
export declare const ChatConversation: mongoose.Model<IChatConversation, {}, {}, {}, mongoose.Document<unknown, {}, IChatConversation, {}, {}> & IChatConversation & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ChatConversation.d.ts.map