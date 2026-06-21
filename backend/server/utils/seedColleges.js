import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { collegeCatalog, syncCollegeCatalog } from './collegeCatalog.js';

dotenv.config();

await connectDB();
await syncCollegeCatalog();
process.exit(0);
