import { Router } from 'express';
import {
  getAllSubcategories,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createSubcategoryValidator,
  updateSubcategoryValidator,
  subcategoryIdValidator,
} from '../validators/category.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Subcategory routes
router.get('/', getAllSubcategories);
router.get('/:id', validate(subcategoryIdValidator), getSubcategoryById);
router.post(
  '/',
  authorize('ADMIN', 'MAINTENANCE'),
  validate(createSubcategoryValidator),
  createSubcategory
);
router.put(
  '/:id',
  authorize('ADMIN', 'MAINTENANCE'),
  validate(updateSubcategoryValidator),
  updateSubcategory
);
router.delete(
  '/:id',
  authorize('ADMIN', 'MAINTENANCE'),
  validate(subcategoryIdValidator),
  deleteSubcategory
);

export default router;
