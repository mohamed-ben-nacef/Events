import { body, param, ValidationChain } from 'express-validator';

export const createCategoryValidator: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name must be between 1 and 100 characters')
    .matches(/^[A-Za-z0-9\s\-_]+$/)
    .withMessage('Category name can only contain letters, numbers, spaces, hyphens, and underscores'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('icon')
    .optional()
    .trim()
    .isURL()
    .withMessage('Icon must be a valid URL')
    .isLength({ max: 255 })
    .withMessage('Icon URL must not exceed 255 characters'),
];

export const updateCategoryValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid category ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name must be between 1 and 100 characters')
    .matches(/^[A-Za-z0-9\s\-_]+$/)
    .withMessage('Category name can only contain letters, numbers, spaces, hyphens, and underscores'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('icon')
    .optional()
    .trim()
    .isURL()
    .withMessage('Icon must be a valid URL')
    .isLength({ max: 255 })
    .withMessage('Icon URL must not exceed 255 characters'),
];

export const categoryIdValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid category ID'),
];

export const createSubcategoryValidator: ValidationChain[] = [
  body('category_id')
    .isUUID()
    .withMessage('Invalid category ID'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Subcategory name must be between 1 and 100 characters')
    .matches(/^[A-Za-z0-9\s\-_]+$/)
    .withMessage('Subcategory name can only contain letters, numbers, spaces, hyphens, and underscores'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
];

export const updateSubcategoryValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid subcategory ID'),
  body('category_id')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Subcategory name must be between 1 and 100 characters')
    .matches(/^[A-Za-z0-9\s\-_]+$/)
    .withMessage('Subcategory name can only contain letters, numbers, spaces, hyphens, and underscores'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
];

export const subcategoryIdValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid subcategory ID'),
];

export const categoryIdQueryValidator: ValidationChain[] = [
  param('categoryId')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
];
