import mongoose, { Document } from 'mongoose';
export interface IFavorite extends Document {
    customerId: mongoose.Types.ObjectId;
    tailorId: mongoose.Types.ObjectId;
    createdAt: Date;
}
export declare const Favorite: mongoose.Model<IFavorite, {}, {}, {}, mongoose.Document<unknown, {}, IFavorite, {}, {}> & IFavorite & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Favorite.d.ts.map