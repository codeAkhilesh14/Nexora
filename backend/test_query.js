import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { RadarEvent } from './server/models/RadarEvent.js';
import { User } from './server/models/User.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const events = await RadarEvent.find({});
  const users = await User.find({});
  
  await mongoose.disconnect();
}

run().catch(console.error);
