import mongoose, { Document, Schema } from 'mongoose';

export interface IDesignSpecification {
  occasion?: string;
  garmentType?: string;
  kameez?: {
    style?: string;
    length?: string;
    neckline?: string;
    sleeves?: string;
    cuffs?: string;
    embroidery?: string;
    embellishments?: string[];
    lace?: string;
    buttons?: string;
    fabric?: string;
    print?: string;
  };
  bottom?: {
    style?: string;
    fabric?: string;
    embroidery?: string;
    length?: string;
  };
  dupatta?: {
    fabric?: string;
    embroidery?: string;
    border?: string;
    tassels?: boolean;
    print?: string;
  };
  colors?: string[];
  primaryColor?: string;
  budget?: string;
  additionalNotes?: string;
  referenceImageUrl?: string;
}

export interface IDesign extends Document {
  customerId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  currentVersion: number;
  specification: IDesignSpecification;
  prompt?: string;
  aiGenerationId?: mongoose.Types.ObjectId;
  referenceImages: string[];
  thumbnailUrl?: string;
  isPublic: boolean;
  isFavorite: boolean;
  tags: string[];
  occasion?: string;
  status: 'draft' | 'saved' | 'sent_to_tailor' | 'approved' | 'in_production';
  createdAt: Date;
  updatedAt: Date;
}

const DesignSpecificationSchema = new Schema({}, { strict: false, _id: false });

const DesignSchema = new Schema<IDesign>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Design title is required'],
      trim: true,
    },
    description: String,
    currentVersion: { type: Number, default: 1 },
    specification: { type: DesignSpecificationSchema, default: {} },
    prompt: String,
    aiGenerationId: { type: Schema.Types.ObjectId, ref: 'AIDesignGeneration' },
    referenceImages: [{ type: String }],
    thumbnailUrl: String,
    isPublic: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    tags: [{ type: String }],
    occasion: { type: String },
    status: {
      type: String,
      enum: ['draft', 'saved', 'sent_to_tailor', 'approved', 'in_production'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

DesignSchema.index({ customerId: 1 });
DesignSchema.index({ customerId: 1, status: 1 });
DesignSchema.index({ tags: 1 });
DesignSchema.index({ createdAt: -1 });

export const Design = mongoose.model<IDesign>('Design', DesignSchema);
