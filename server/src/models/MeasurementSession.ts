import mongoose, { Document, Schema } from 'mongoose';

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

const MeasurementSessionSchema = new Schema<IMeasurementSession>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['uploading', 'processing', 'completed', 'failed', 'measurements_saved'],
      default: 'uploading',
    },
    uploadedImages: [{ type: String }],
    aiEstimates: { type: Map, of: Number, default: {} },
    customerEdits: { type: Map, of: Number, default: {} },
    finalMeasurements: { type: Map, of: Number, default: {} },
    aiConfidence: { type: Number, min: 0, max: 100 },
    aiNotes: String,
    privacyAcknowledged: { type: Boolean, default: false },
    imagesDeleted: { type: Boolean, default: false },
    imagesDeletedAt: Date,
    errorMessage: String,
  },
  { timestamps: true }
);

MeasurementSessionSchema.index({ customerId: 1 });
MeasurementSessionSchema.index({ status: 1 });
MeasurementSessionSchema.index({ createdAt: 1 });

export const MeasurementSession = mongoose.model<IMeasurementSession>('MeasurementSession', MeasurementSessionSchema);
