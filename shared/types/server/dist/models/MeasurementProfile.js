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
exports.MeasurementProfile = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const MeasurementsSchema = new mongoose_1.Schema({
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
}, { _id: false });
const MeasurementProfileSchema = new mongoose_1.Schema({
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
    aiSessionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MeasurementSession' },
    version: { type: Number, default: 1 },
}, { timestamps: true });
MeasurementProfileSchema.index({ customerId: 1 });
MeasurementProfileSchema.index({ customerId: 1, isVerified: 1 });
exports.MeasurementProfile = mongoose_1.default.model('MeasurementProfile', MeasurementProfileSchema);
//# sourceMappingURL=MeasurementProfile.js.map