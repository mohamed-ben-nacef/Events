import { Router } from 'express';
import {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentStatusHistory,
  updateEquipmentStatus,
} from '../controllers/equipment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createEquipmentValidator,
  updateEquipmentValidator,
  equipmentIdValidator,
  updateEquipmentStatusValidator,
  equipmentQueryValidator,
} from '../validators/equipment.validator';

const router = Router();

// Equipment routes
router.get(
  '/',
  validate(equipmentQueryValidator),
  getAllEquipment
);
router.get(
  '/:id',
  validate(equipmentIdValidator),
  getEquipmentById
);

// All other routes require authentication
router.use(authenticate);
router.post(
  '/',
  authorize('ADMIN', 'MAINTENANCE'),
  validate(createEquipmentValidator),
  createEquipment
);
router.put(
  '/:id',
  authorize('ADMIN', 'MAINTENANCE'),
  validate(updateEquipmentValidator),
  updateEquipment
);
router.delete(
  '/:id',
  authorize('ADMIN'),
  validate(equipmentIdValidator),
  deleteEquipment
);

// Equipment status routes
router.get(
  '/:id/status',
  validate(equipmentIdValidator),
  getEquipmentStatusHistory
);
router.post(
  '/:id/status',
  validate(updateEquipmentStatusValidator),
  updateEquipmentStatus
);

export default router;
