import mongoose, { Document } from 'mongoose';
export type SessionStatus = 'uploading' | 'processing' | 'completed' | 'failed' | 'measurements_saved';
export interface IMeasurementSession extends Document {
    customerId: mongoose.Types.ObjectId;
    status: SessionStatus;
    uploadedImages: string[];
    aiEstimates: Record<string, number>;
    customerEdits: Record<string, number>;
    finalMeasurements: Record<string, number>;
    aiConfidence?: number;
    aiNotes?: string;
    privacyAcknowledged: boolean;
    imagesDeleted: boolean;
    imagesDeletedAt?: Date;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const MeasurementSession: mongoose.Model<IMeasurementSession, {}, {}, {}, mongoose.Document<unknown, {}, IMeasurementSession, {}, {}> & IMeasurementSession & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=MeasurementSession.d.ts.map