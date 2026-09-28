"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Design = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const DesignSpecificationSchema = new mongoose_1.Schema({}, { strict: false, _id: false });
const DesignSchema = new mongoose_1.Schema({
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
    aiGenerationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AIDesignGeneration' },
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
}, { timestamps: true });
DesignSchema.index({ customerId: 1 });
DesignSchema.index({ customerId: 1, status: 1 });
DesignSchema.index({ tags: 1 });
DesignSchema.index({ createdAt: -1 });
exports.Design = mongoose_1.default.model('Design', DesignSchema);
//# sourceMappingURL=Design.js.map