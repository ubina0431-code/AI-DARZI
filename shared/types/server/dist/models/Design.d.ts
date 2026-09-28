import mongoose, { Document } from 'mongoose';
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
export declare const Design: mongoose.Model<IDesign, {}, {}, {}, mongoose.Document<unknown, {}, IDesign, {}, {}> & IDesign & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Design.d.ts.map