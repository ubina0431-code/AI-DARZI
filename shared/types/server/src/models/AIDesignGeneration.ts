import mongoose, { Document, Schema } from 'mongoose';

export interface IAIDesignGeneration {
  customerId: mongoose.Types.ObjectId;
  designId?: mongoose.Types.ObjectId;
  prompt: string;
  structuredSpec: Record<string, unknown>;
  model: string;
  tokensUsed?: number;
  processingTimeMs?: number;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
}

const AIDesignGenerationSchema = new Schema<IAIDesignGeneration>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    designId: { type: Schema.Types.ObjectId, ref: 'Design' },
    prompt: { type: String, required: true },
    structuredSpec: { type: Schema.Types.Mixed, default: {} },
    model: { type: String, default: 'gemini-1.5-flash' },
    tokensUsed: Number,
    processingTimeMs: Number,
    success: { type: Boolean, default: true },
    errorMessage: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AIDesignGenerationSchema.index({ customerId: 1 });
AIDesignGenerationSchema.index({ designId: 1 });

export const AIDesignGeneration = mongoose.model<IAIDesignGeneration>('AIDesignGeneration', AIDesignGenerationSchema);
