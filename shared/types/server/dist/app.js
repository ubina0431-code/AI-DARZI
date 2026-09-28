"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const error_1 = require("./middleware/error");
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const tailor_routes_1 = __importDefault(require("./routes/tailor.routes"));
const measurement_routes_1 = __importDefault(require("./routes/measurement.routes"));
const design_routes_1 = __importDefault(require("./routes/design.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const app = (0, express_1.default)();
// Security headers
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// CORS
app.use((0, cors_1.default)({
    origin: config_1.config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', limiter);
// Auth rate limiter (stricter)
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging
if (config_1.config.nodeEnv === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Static files for uploads
app.use('/uploads', express_1.default.static(path_1.default.resolve(config_1.config.uploadDir)));
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'AI Darzi API is running',
        environment: config_1.config.nodeEnv,
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/tailors', tailor_routes_1.default);
app.use('/api/measurements', measurement_routes_1.default);
app.use('/api/designs', design_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/chat', chat_routes_1.default);
app.use('/api/reviews', review_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// 404 handler
app.use(error_1.notFound);
// Error handler
app.use(error_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map