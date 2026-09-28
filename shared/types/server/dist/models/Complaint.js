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
exports.Complaint = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ComplaintSchema = new mongoose_1.Schema({
    reportedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedByRole: { type: String, required: true },
    targetUserId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order' },
    type: {
        type: String,
        enum: ['harassment', 'fraud', 'poor_quality', 'no_show', 'payment_issue', 'other'],
        required: true,
    },
    description: { type: String, required: true, maxlength: 2000 },
    status: {
        type: String,
        enum: ['open', 'under_review', 'resolved', 'dismissed'],
        default: 'open',
    },
    adminNotes: String,
    resolvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
}, { timestamps: true });
ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ reportedBy: 1 });
ComplaintSchema.index({ targetUserId: 1 });
exports.Complaint = mongoose_1.default.model('Complaint', ComplaintSchema);
//# sourceMappingURL=Complaint.js.map