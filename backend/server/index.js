import dns from 'node:dns';
import http from 'node:http';

dns.setDefaultResultOrder('ipv4first');
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { authLimiter, apiLimiter } from './middleware/rateLimit.middleware.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import crushRoutes from './routes/crush.routes.js';
import discoveryRoutes from './routes/discovery.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import profileRoutes from './routes/profile.routes.js';
import roomRoutes from './routes/room.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import { webhook as subscriptionWebhook } from './controllers/subscription.controller.js';
import { registerSockets } from './sockets/index.js';
import { syncCollegeCatalog } from './utils/collegeCatalog.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const corsOptions = {
  origin(origin, callback) {
    if (!origin || env.frontendOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin ${origin}`));
  },
  credentials: true
};

const io = new Server(server, { cors: corsOptions });

app.set('trust proxy', 1);
app.set('io', io);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(cookieParser());

app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), subscriptionWebhook);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/api', apiLimiter);

app.get('/health', (_req, res) => res.json({ ok: true, name: 'Nexora API', ts: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/crushes', crushRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

registerSockets(io);
app.use(notFound);
app.use(errorHandler);

await connectDB();
await syncCollegeCatalog();
server.listen(env.port, () => {
  console.log('Server is running on port no 8080');
});
