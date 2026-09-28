import mongoose, { Document } from 'mongoose';
export interface IComplaint extends Document {
    reportedBy: mongoose.Types.ObjectId;
    reportedByRole: string;
    targetUserId: mongoose.Types.ObjectId;
    orderId?: mongoose.Types.ObjectId;
    type: 'harassment' | 'fraud' | 'poor_quality' | 'no_show' | 'payment_issue' | 'other';
    description: string;
    status: 'open' | 'under_review' | 'resolved' | 'dismissed';
    adminNotes?: string;
    resolvedBy?: mongoose.Types.ObjectId;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Complaint: mongoose.Model<IComplaint, {}, {}, {}, mongoose.Document<unknown, {}, IComplaint, {}, {}> & IComplaint & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Complaint.d.ts.map