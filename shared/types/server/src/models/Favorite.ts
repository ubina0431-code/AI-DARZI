import mongoose, { Document, Schema } from 'mongoose';

export interface IFavorite extends Document {
  customerId: mongoose.Types.ObjectId;
  tailorId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tailorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

FavoriteSchema.index({ customerId: 1, tailorId: 1 }, { unique: true });
FavoriteSchema.index({ tailorId: 1 });

export const Favorite = mongoose.model<IFavorite>('Favorite', FavoriteSchema);
