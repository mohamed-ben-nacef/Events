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

// All routes require authentication
router.use(authenticate);

// Category routes
router.get('/', getAllCategories);
router.get('/:id', validate(categoryIdValidator), getCategoryById);
router.post(
  '/',
  authorize('ADMIN'),
  validate(createCategoryValidator),
  createCategory
);
router.put(
  '/:id',
  authorize('ADMIN'),
  validate(updateCategoryValidator),
  updateCategory
);
router.delete(
  '/:id',
  authorize('ADMIN'),
  validate(categoryIdValidator),
  deleteCategory
);

export default router;
