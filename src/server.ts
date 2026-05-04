import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

import { sequelize } from './models';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import subcategoryRoutes from './routes/subcategory.routes';
import equipmentRoutes from './routes/equipment.routes';
import eventRoutes from './routes/event.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import vehicleRoutes from './routes/vehicle.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import activityLogRoutes from './routes/activityLog.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

const app = express();
const port = process.env.PORT || 3000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Must be registered BEFORE helmet, routes, and the rate limiter so that
// preflight OPTIONS requests receive the correct headers even when they would
// otherwise be rejected (e.g. by a 404 or rate-limit response).
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim());

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204, // Some legacy browsers choke on 204 for OPTIONS
};

// Handle preflight for every route first (Express 5 requires named wildcards)
app.options('/{*path}', cors(corsOptions) as express.RequestHandler);

// Apply CORS to all subsequent routes
app.use(cors(corsOptions));

// ─── Security & Logging ───────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan('dev'));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger ───────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// If the app sits behind a proxy (Render, Heroku, Nginx, etc.) uncomment the
// line below so express-rate-limit reads the real client IP from X-Forwarded-For.
app.set('trust proxy', 1);
app.use('/api', apiLimiter);

// ─── Static Files ─────────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ─── Health & DB Checks ───────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), message: 'Server is running' });
});

app.get('/api/db-check', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'connected', message: 'Database connection successful' });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/maintenances', maintenanceRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/whatsapp-messages', whatsappRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/users', userRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  try {
    await sequelize.authenticate();
    // Use .sync() without { alter: true } or { force: true } to avoid
    // unintended data loss on restart. Run `npm run sync` manually when you
    // need to apply schema changes.
    await sequelize.sync();
    console.log('Database connected and synced successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});

// Capture any unhandled errors so the console tells us why it crashed
process.on('uncaughtException', (error) => {
  console.error('CRITICAL: Uncaught Exception! Server going down...', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Promise Rejection! Server going down...', reason);
  process.exit(1);
});