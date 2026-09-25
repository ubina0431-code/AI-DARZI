import mongoose from 'mongoose';
import { config } from './index';

export const connectDB = async (): Promise<void> => {
  if (!config.mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set. Please configure your .env file.');
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('   Error:', (error as Error).message);
    console.error('   Please check your MONGODB_URI in the .env file.');
    console.error('   Make sure your IP is whitelisted in MongoDB Atlas.');
    throw error;
  }
};
