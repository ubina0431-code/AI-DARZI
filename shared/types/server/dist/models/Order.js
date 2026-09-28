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
exports.Order = exports.ORDER_STATUS_TRANSITIONS = exports.VALID_ORDER_STATUSES = void 0;
const mongoose_1 = __importStar(require("mongoose"));
exports.VALID_ORDER_STATUSES = [
    'created', 'tailor_reviewing', 'price_quoted', 'customer_approval',
    'payment_pending', 'accepted', 'measurement_confirmed', 'design_confirmed',
    'cutting', 'stitching', 'quality_check', 'ready', 'out_for_delivery',
    'delivered', 'completed', 'cancelled',
];
// Valid transitions map
exports.ORDER_STATUS_TRANSITIONS = {
    created: ['tailor_reviewing', 'stitching', 'cancelled'],
    tailor_reviewing: ['price_quoted', 'stitching', 'cancelled'],
    price_quoted: ['customer_approval', 'cancelled'],
    customer_approval: ['payment_pending', 'cancelled'],
    payment_pending: ['accepted', 'cancelled'],
    accepted: ['measurement_confirmed', 'cancelled'],
    measurement_confirmed: ['design_confirmed', 'cancelled'],
    design_confirmed: ['cutting', 'cancelled'],
    cutting: ['stitching'],
    stitching: ['quality_check', 'delivered'],
    quality_check: ['ready', 'stitching'],
    ready: ['out_for_delivery', 'delivered'],
    out_for_delivery: ['delivered'],
    delivered: ['completed'],
    completed: [],
    cancelled: [],
};
const OrderSchema = new mongoose_1.Schema({
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tailorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    designId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Design' },
    measurementProfileId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MeasurementProfile' },
    conversationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ChatConversation' },
    status: {
        type: String,
        enum: exports.VALID_ORDER_STATUSES,
        default: 'created',
    },
    title: { type: String, required: true, trim: true },
    description: String,
    specialInstructions: String,
    quotedPrice: { type: Number, min: 0 },
    finalPrice: { type: Number, min: 0 },
    currency: { type: String, default: 'PKR' },
    estimatedCompletionDate: Date,
    actualCompletionDate: Date,
    customerApprovedPrice: { type: Boolean, default: false },
    customerApprovedDesign: { type: Boolean, default: false },
    customerApprovedMeasurements: { type: Boolean, default: false },
    approvalTimestamp: Date,
    isOverseasOrder: { type: Boolean, default: false },
    deliveryAddress: String,
    deliveryCity: String,
    deliveryCountry: String,
    rejectionReason: String,
}, { timestamps: true });
OrderSchema.index({ customerId: 1, status: 1 });
OrderSchema.index({ tailorId: 1, status: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
exports.Order = mongoose_1.default.model('Order', OrderSchema);
//# sourceMappingURL=Order.js.map