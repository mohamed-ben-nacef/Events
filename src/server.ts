
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
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
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), message: 'Server is running' });
});

// Database Connection Check
app.get('/api/db-check', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'connected', message: 'Database connection successful' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Database connection failed', error: error.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/maintenances', maintenanceRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/whatsapp-messages', whatsappRoutes);
app.use('/api/activity-logs', activityLogRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Database connected and synced successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});
