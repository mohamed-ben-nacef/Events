import { Router } from 'express';
import { getAllUsers, getUserById } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// User routes
router.get('/', getAllUsers);

// All other routes require authentication
router.use(authenticate);

router.get('/:id', getUserById);

export default router;
