import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  if (!env.mongoUri) throw new Error('MONGODB_URI is required');
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, { autoIndex: env.nodeEnv !== 'production' });
  console.log('MongoDB connected');
};
