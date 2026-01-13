import { Router } from 'express';
import {
  getAllActivityLogs,
  getActivityLogById,
  getUserActivityLogs,
  getEntityActivityLogs,
  exportActivityLogs,
} from '../controllers/activityLog.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  activityLogQueryValidator,
  userIdValidator,
  entityValidator,
} from '../validators/activityLog.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Activity log routes
router.get(
  '/',
  validate(activityLogQueryValidator),
  getAllActivityLogs
);
router.get(
  '/:id',
  getActivityLogById
);
router.get(
  '/users/:userId',
  validate(userIdValidator),
  validate(activityLogQueryValidator),
  getUserActivityLogs
);
router.get(
  '/entity/:entityType/:entityId',
  validate(entityValidator),
  getEntityActivityLogs
);
router.get(
  '/export/csv',
  validate(activityLogQueryValidator),
  exportActivityLogs
);

export default router;
