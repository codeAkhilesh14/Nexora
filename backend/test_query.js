import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { RadarEvent } from './server/models/RadarEvent.js';
import { User } from './server/models/User.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const events = await RadarEvent.find({});
  const users = await User.find({});
  
  console.log('--- RADAR EVENTS ---');
  console.log(events.map(e => ({
    user: users.find(u => u._id.toString() === e.user.toString())?.nickname || e.user,
    zone: e.zone,
    happenedAt: e.happenedAt
  })));

  await mongoose.disconnect();
}

run().catch(console.error);
