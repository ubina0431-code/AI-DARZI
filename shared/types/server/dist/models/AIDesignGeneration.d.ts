import mongoose from 'mongoose';
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
export declare const AIDesignGeneration: mongoose.Model<IAIDesignGeneration, {}, {}, {}, mongoose.Document<unknown, {}, IAIDesignGeneration, {}, {}> & IAIDesignGeneration & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
//# sourceMappingURL=AIDesignGeneration.d.ts.map