import mongoose, { Document } from 'mongoose';
export type UserRole = 'customer' | 'tailor' | 'admin';
export interface IUser extends Document {
    email: string;
    phone?: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    avatar?: string;
    isVerified: boolean;
    isActive: boolean;
    isEmailVerified: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map