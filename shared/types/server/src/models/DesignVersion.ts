import mongoose, { Document, Schema } from 'mongoose';

export interface IDesignVersion extends Document {
  designId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  version: number;
  specification: Record<string, unknown>;
  prompt?: string;
  editInstruction?: string;
  aiGenerationId?: mongoose.Types.ObjectId;
  changeDescription?: string;
  createdAt: Date;
}

const DesignVersionSchema = new Schema<IDesignVersion>(
  {
    designId: {
      type: Schema.Types.ObjectId,
      ref: 'Design',
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    version: { type: Number, required: true },
    specification: { type: Schema.Types.Mixed, default: {} },
    prompt: String,
    editInstruction: String,
    aiGenerationId: { type: Schema.Types.ObjectId, ref: 'AIDesignGeneration' },
    changeDescription: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

DesignVersionSchema.index({ designId: 1, version: 1 });
DesignVersionSchema.index({ customerId: 1 });

export const DesignVersion = mongoose.model<IDesignVersion>('DesignVersion', DesignVersionSchema);
