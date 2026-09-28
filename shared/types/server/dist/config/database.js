"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("./index");
const connectDB = async () => {
    if (!index_1.config.mongoUri) {
        throw new Error('MONGODB_URI environment variable is not set. Please configure your .env file.');
    }
    try {
        const conn = await mongoose_1.default.connect(index_1.config.mongoUri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📦 Database: ${conn.connection.name}`);
        mongoose_1.default.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
        });
    }
    catch (error) {
        console.error('❌ MongoDB connection failed:');
        console.error('   Error:', error.message);
        console.error('   Please check your MONGODB_URI in the .env file.');
        console.error('   Make sure your IP is whitelisted in MongoDB Atlas.');
        throw error;
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=database.js.map