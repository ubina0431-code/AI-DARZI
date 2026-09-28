import mongoose, { Document } from 'mongoose';
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
export declare const DesignVersion: mongoose.Model<IDesignVersion, {}, {}, {}, mongoose.Document<unknown, {}, IDesignVersion, {}, {}> & IDesignVersion & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=DesignVersion.d.ts.map