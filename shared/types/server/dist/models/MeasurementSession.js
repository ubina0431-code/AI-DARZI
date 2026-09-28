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
exports.MeasurementSession = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const MeasurementSessionSchema = new mongoose_1.Schema({
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['uploading', 'processing', 'completed', 'failed', 'measurements_saved'],
        default: 'uploading',
    },
    uploadedImages: [{ type: String }],
    aiEstimates: { type: Map, of: Number, default: {} },
    customerEdits: { type: Map, of: Number, default: {} },
    finalMeasurements: { type: Map, of: Number, default: {} },
    aiConfidence: { type: Number, min: 0, max: 100 },
    aiNotes: String,
    privacyAcknowledged: { type: Boolean, default: false },
    imagesDeleted: { type: Boolean, default: false },
    imagesDeletedAt: Date,
    errorMessage: String,
}, { timestamps: true });
MeasurementSessionSchema.index({ customerId: 1 });
MeasurementSessionSchema.index({ status: 1 });
MeasurementSessionSchema.index({ createdAt: 1 });
exports.MeasurementSession = mongoose_1.default.model('MeasurementSession', MeasurementSessionSchema);
//# sourceMappingURL=MeasurementSession.js.map