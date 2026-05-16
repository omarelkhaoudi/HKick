import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { authRouter } from './routes/auth.routes.js';
import { profileRouter } from './routes/profile.routes.js';
import { matchRouter } from './routes/match.routes.js';
import { terrainRouter } from './routes/terrain.routes.js';
import { bookingRouter } from './routes/booking.routes.js';
import { availabilityRouter } from './routes/availability.routes.js';
import { notificationRouter } from './routes/notification.routes.js';
import { walletRouter } from './routes/wallet.routes.js';
import { opsRouter } from './routes/ops.routes.js';
import { paymentRouter } from './routes/payment.routes.js';
import { createCorsOptions, getAllowedOrigins } from './config/cors.js';
import { rateLimit } from './middleware/rateLimit.js';
import { registerSockets } from './sockets/index.js';

const app = express();
const server = http.createServer(app);
const allowedOrigins = getAllowedOrigins();
const corsOptions = createCorsOptions();

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '64kb' }));
app.use(rateLimit({ windowMs: 60_000, max: Number(process.env.API_RATE_LIMIT_PER_MINUTE || 180), keyPrefix: 'api' }));
app.use(morgan('dev'));
app.set('io', io);
app.use((req, _res, next) => {
  req.io = io;
  next();
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'hkick-api' });
});

app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/matches', matchRouter);
app.use('/api/terrains', terrainRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/ops', opsRouter);
app.use('/api/payments', paymentRouter);

registerSockets(io);

app.use((error, _req, res, _next) => {
  if (error?.name === 'ZodError') {
    return res.status(422).json({ message: 'Invalid request payload', issues: error.issues });
  }

  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request payload is too large' });
  }

  if (error?.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ message: 'Origin not allowed by CORS' });
  }

  if (error?.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error(error);
  res.status(500).json({ message: 'Something went wrong' });
});

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`HKick API listening on http://localhost:${port}`);
});
