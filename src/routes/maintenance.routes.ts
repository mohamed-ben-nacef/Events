import { Router } from 'express';
import {
  getAllMaintenances,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  completeMaintenance,
  deleteMaintenance,
  addMaintenanceLog,
} from '../controllers/maintenance.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createMaintenanceValidator,
  updateMaintenanceValidator,
  completeMaintenanceValidator,
  maintenanceIdValidator,
  maintenanceQueryValidator,
} from '../validators/maintenance.validator';

import { upload } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Maintenance routes
router.get(
  '/',
  validate(maintenanceQueryValidator),
  getAllMaintenances
);
router.get(
  '/:id',
  validate(maintenanceIdValidator),
  getMaintenanceById
);
router.post(
  '/',
  authorize('ADMIN', 'MAINTENANCE', 'TECHNICIEN'),
  upload.array('photos', 5),
  createMaintenance
);
router.put(
  '/:id',
  authorize('ADMIN', 'MAINTENANCE', 'TECHNICIEN'),
  upload.array('photos', 5),
  validate(updateMaintenanceValidator),
  updateMaintenance
);
router.post(
  '/:id/complete',
  authorize('ADMIN', 'MAINTENANCE', 'TECHNICIEN'),
  upload.array('photos', 5),
  validate(completeMaintenanceValidator),
  completeMaintenance
);
router.delete(
  '/:id',
  authorize('ADMIN'),
  validate(maintenanceIdValidator),
  deleteMaintenance
);

router.post(
  '/:id/logs',
  authorize('ADMIN', 'MAINTENANCE', 'TECHNICIEN'),
  upload.array('photos', 5),
  addMaintenanceLog
);

export default router;
