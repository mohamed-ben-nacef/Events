import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllSubcategories,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator,
  createSubcategoryValidator,
  updateSubcategoryValidator,
  subcategoryIdValidator,
} from '../validators/category.validator';

const router = Router();

// Category routes
router.get('/', getAllCategories);

// All other routes require authentication
router.use(authenticate);

router.get('/:id', validate(categoryIdValidator), getCategoryById);
router.post(
  '/',
  authorize('ADMIN', 'MAINTENANCE'),
  validate(createCategoryValidator),
  createCategory
);
router.put(
  '/:id',
  authorize('ADMIN', 'MAINTENANCE'),
  validate(updateCategoryValidator),
  updateCategory
);
router.delete(
  '/:id',
  authorize('ADMIN', 'MAINTENANCE'),
  validate(categoryIdValidator),
  deleteCategory
);

export default router;
