"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const database_1 = require("./config/database");
const socket_server_1 = require("./socket/socket.server");
const startServer = async () => {
    try {
        console.log('🚀 Starting AI Darzi Server...');
        console.log(`📌 Environment: ${config_1.config.nodeEnv}`);
        // Step 1: Connect to MongoDB
        await (0, database_1.connectDB)();
        // Step 2: Create HTTP server
        const httpServer = http_1.default.createServer(app_1.default);
        // Step 3: Initialize Socket.IO
        const io = (0, socket_server_1.initSocketIO)(httpServer);
        console.log('✅ Socket.IO initialized');
        // Step 4: Start listening
        httpServer.listen(config_1.config.port, () => {
            console.log('');
            console.log('╔════════════════════════════════════════╗');
            console.log('║         AI DARZI SERVER STARTED        ║');
            console.log('╠════════════════════════════════════════╣');
            console.log(`║  Port:     ${config_1.config.port}                          ║`);
            console.log(`║  API:      http://localhost:${config_1.config.port}/api      ║`);
            console.log(`║  Health:   http://localhost:${config_1.config.port}/api/health║`);
            console.log('╚════════════════════════════════════════╝');
            console.log('');
        });
        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
            httpServer.close(() => {
                console.log('✅ Server closed.');
                process.exit(0);
            });
        });
        process.on('SIGINT', () => {
            console.log('\n🛑 SIGINT received. Shutting down...');
            httpServer.close(() => {
                process.exit(0);
            });
        });
    }
    catch (error) {
        console.error('');
        console.error('╔════════════════════════════════════════╗');
        console.error('║          SERVER STARTUP FAILED         ║');
        console.error('╚════════════════════════════════════════╝');
        console.error('Error:', error.message);
        console.error('');
        console.error('Common fixes:');
        console.error('  1. Check MONGODB_URI in server/.env');
        console.error('  2. Whitelist your IP in MongoDB Atlas');
        console.error('  3. Verify JWT_SECRET is set');
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map