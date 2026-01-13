import { Router } from 'express';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAllTransports,
  getTransportById,
  createTransport,
  updateTransportStatus,
  completeTransport,
  deleteTransport,
} from '../controllers/vehicle.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createVehicleValidator,
  updateVehicleValidator,
  vehicleIdValidator,
  createTransportValidator,
  updateTransportStatusValidator,
  completeTransportValidator,
  transportIdValidator,
  transportQueryValidator,
} from '../validators/vehicle.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Vehicle routes
router.get('/', getAllVehicles);
router.get('/:id', validate(vehicleIdValidator), getVehicleById);
router.post(
  '/',
  authorize('ADMIN'),
  validate(createVehicleValidator),
  createVehicle
);
router.put(
  '/:id',
  authorize('ADMIN'),
  validate(updateVehicleValidator),
  updateVehicle
);
router.delete(
  '/:id',
  authorize('ADMIN'),
  validate(vehicleIdValidator),
  deleteVehicle
);

// Transport routes
router.get(
  '/transports/all',
  validate(transportQueryValidator),
  getAllTransports
);
router.get(
  '/transports/:id',
  validate(transportIdValidator),
  getTransportById
);
router.post(
  '/transports',
  validate(createTransportValidator),
  createTransport
);
router.put(
  '/transports/:id/status',
  validate(updateTransportStatusValidator),
  updateTransportStatus
);
router.post(
  '/transports/:id/complete',
  validate(completeTransportValidator),
  completeTransport
);
router.delete(
  '/transports/:id',
  authorize('ADMIN'),
  validate(transportIdValidator),
  deleteTransport
);

export default router;
