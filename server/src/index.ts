import http from 'http';
import app from './app';
import { config } from './config';
import { connectDB } from './config/database';
import { initSocketIO } from './socket/socket.server';

const startServer = async (): Promise<void> => {
  try {
    console.log('🚀 Starting AI Darzi Server...');
    console.log(`📌 Environment: ${config.nodeEnv}`);

    // Step 1: Connect to MongoDB
    await connectDB();

    // Step 2: Create HTTP server
    const httpServer = http.createServer(app);

    // Step 3: Initialize Socket.IO
    const io = initSocketIO(httpServer);
    console.log('✅ Socket.IO initialized');

    // Step 4: Start listening
    httpServer.listen(config.port, () => {
      console.log('');
      console.log('╔════════════════════════════════════════╗');
      console.log('║         AI DARZI SERVER STARTED        ║');
      console.log('╠════════════════════════════════════════╣');
      console.log(`║  Port:     ${config.port}                          ║`);
      console.log(`║  API:      http://localhost:${config.port}/api      ║`);
      console.log(`║  Health:   http://localhost:${config.port}/api/health║`);
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

  } catch (error) {
    console.error('');
    console.error('╔════════════════════════════════════════╗');
    console.error('║          SERVER STARTUP FAILED         ║');
    console.error('╚════════════════════════════════════════╝');
    console.error('Error:', (error as Error).message);
    console.error('');
    console.error('Common fixes:');
    console.error('  1. Check MONGODB_URI in server/.env');
    console.error('  2. Whitelist your IP in MongoDB Atlas');
    console.error('  3. Verify JWT_SECRET is set');
    process.exit(1);
  }
};

startServer();
