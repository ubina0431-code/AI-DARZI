import mongoose, { Document, Schema } from 'mongoose';

export interface IMeasurements {
  // Upper body
  shoulder?: number;
  chest?: number;
  bust?: number;
  waist?: number;
  hip?: number;
  // Arms
  sleeve?: number;
  armhole?: number;
  wrist?: number;
  // Torso lengths
  kameezeLength?: number;
  kurtaLength?: number;
  // Lower body
  trouserLength?: number;
  shalwarLength?: number;
  thigh?: number;
  inseam?: number;
  outseam?: number;
  // Other
  neck?: number;
  // Custom fields
  custom?: Record<string, number>;
}

export interface IMeasurementProfile extends Document {
  customerId: mongoose.Types.ObjectId;
  gender?: 'male' | 'female';
  garment?: 'kameez' | 'shalwar' | 'suit' | 'waistcoat';
  name: string;
  measurements: IMeasurements;
  unit: 'inches' | 'cm';
  isVerified: boolean;
  verifiedAt?: Date;
  notes?: string;
  aiGenerated: boolean;
  aiSessionId?: mongoose.Types.ObjectId;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const MeasurementsSchema = new Schema<IMeasurements>(
  {
    shoulder: { type: Number, min: 0 },
    chest: { type: Number, min: 0 },
    bust: { type: Number, min: 0 },
    waist: { type: Number, min: 0 },
    hip: { type: Number, min: 0 },
    sleeve: { type: Number, min: 0 },
    armhole: { type: Number, min: 0 },
    wrist: { type: Number, min: 0 },
    kameezeLength: { type: Number, min: 0 },
    kurtaLength: { type: Number, min: 0 },
    trouserLength: { type: Number, min: 0 },
    shalwarLength: { type: Number, min: 0 },
    thigh: { type: Number, min: 0 },
    inseam: { type: Number, min: 0 },
    outseam: { type: Number, min: 0 },
    neck: { type: Number, min: 0 },
    custom: { type: Map, of: Number },
  },
  { _id: false }
);

const MeasurementProfileSchema = new Schema<IMeasurementProfile>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
    },
    garment: {
      type: String,
      enum: ['kameez', 'shalwar', 'suit', 'waistcoat'],
    },
    name: {
      type: String,
      required: [true, 'Profile name is required'],
      trim: true,
      default: 'My Measurements',
    },
    measurements: { type: MeasurementsSchema, default: {} },
    unit: {
      type: String,
      enum: ['inches', 'cm'],
      default: 'inches',
    },
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    notes: String,
    aiGenerated: { type: Boolean, default: false },
    aiSessionId: { type: Schema.Types.ObjectId, ref: 'MeasurementSession' },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

MeasurementProfileSchema.index({ customerId: 1 });
MeasurementProfileSchema.index({ customerId: 1, isVerified: 1 });

export const MeasurementProfile = mongoose.model<IMeasurementProfile>('MeasurementProfile', MeasurementProfileSchema);
