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
exports.CustomerProfile = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CustomerProfileSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'prefer_not_to_say'],
    },
    dateOfBirth: { type: Date },
    country: { type: String, default: 'Pakistan' },
    city: { type: String, trim: true },
    address: { type: String },
    isOverseas: { type: Boolean, default: false },
    preferredLanguage: { type: String, default: 'en' },
    currency: { type: String, default: 'PKR' },
    privacySettings: {
        deleteMeasurementPhotos: { type: Boolean, default: true },
        shareDataWithTailors: { type: Boolean, default: true },
        allowReviews: { type: Boolean, default: true },
    },
    tailorPreferences: {
        genderPreference: {
            type: String,
            enum: ['female_only', 'male_only', 'no_preference'],
            default: 'no_preference',
        },
        hijabFriendly: { type: Boolean, default: false },
        homeService: { type: Boolean, default: false },
    },
}, { timestamps: true });
CustomerProfileSchema.index({ userId: 1 });
CustomerProfileSchema.index({ country: 1, city: 1 });
exports.CustomerProfile = mongoose_1.default.model('CustomerProfile', CustomerProfileSchema);
//# sourceMappingURL=CustomerProfile.js.map