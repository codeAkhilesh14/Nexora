import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  if (!env.mongoUri) throw new Error('MONGODB_URI is required');
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, {
    autoIndex: env.nodeEnv !== 'production',
    socketTimeoutMS: 30000,   // Abort database queries if socket hangs for more than 30s
    connectTimeoutMS: 30000,  // Timeout connection attempt after 30s
  });
  console.log('MongoDB connected successfully');
};

