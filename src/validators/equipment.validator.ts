import { body, param, query, ValidationChain } from 'express-validator';

export const createEquipmentValidator: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Equipment name must be between 1 and 255 characters'),
  body('category_id')
    .isUUID()
    .withMessage('Invalid category ID'),
  body('subcategory_id')
    .optional()
    .isUUID()
    .withMessage('Invalid subcategory ID'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand must not exceed 100 characters'),
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Model must not exceed 100 characters'),
  body('description')
    .optional()
    .trim(),
  body('technical_specs')
    .optional()
    .trim(),
  body('quantity_total')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total quantity must be a non-negative integer'),
  body('purchase_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a non-negative number'),
  body('daily_rental_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Daily rental price must be a non-negative number'),
  body('purchase_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Purchase date must be a valid date (YYYY-MM-DD)'),
  body('warranty_end_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Warranty end date must be a valid date (YYYY-MM-DD)'),
  body('supplier')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Supplier must not exceed 255 characters'),
  body('weight_kg')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a non-negative number'),
  body('qr_code_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('QR code URL must be a valid URL')
    .isLength({ max: 500 })
    .withMessage('QR code URL must not exceed 500 characters'),
  body('photos')
    .optional()
    .isArray()
    .withMessage('Photos must be an array'),
  body('photos.*')
    .optional()
    .isURL()
    .withMessage('Each photo must be a valid URL'),
  body('manual_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Manual URL must be a valid URL')
    .isLength({ max: 500 })
    .withMessage('Manual URL must not exceed 500 characters'),
];

export const updateEquipmentValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid equipment ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Equipment name must be between 1 and 255 characters'),
  body('category_id')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  body('subcategory_id')
    .optional()
    .isUUID()
    .withMessage('Invalid subcategory ID'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand must not exceed 100 characters'),
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Model must not exceed 100 characters'),
  body('description')
    .optional()
    .trim(),
  body('technical_specs')
    .optional()
    .trim(),
  body('quantity_total')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total quantity must be a non-negative integer'),
  body('purchase_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a non-negative number'),
  body('daily_rental_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Daily rental price must be a non-negative number'),
  body('purchase_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Purchase date must be a valid date (YYYY-MM-DD)'),
  body('warranty_end_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Warranty end date must be a valid date (YYYY-MM-DD)'),
  body('supplier')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Supplier must not exceed 255 characters'),
  body('weight_kg')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a non-negative number'),
  body('qr_code_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('QR code URL must be a valid URL')
    .isLength({ max: 500 })
    .withMessage('QR code URL must not exceed 500 characters'),
  body('photos')
    .optional()
    .isArray()
    .withMessage('Photos must be an array'),
  body('photos.*')
    .optional()
    .isURL()
    .withMessage('Each photo must be a valid URL'),
  body('manual_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Manual URL must be a valid URL')
    .isLength({ max: 500 })
    .withMessage('Manual URL must not exceed 500 characters'),
];

export const equipmentIdValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid equipment ID'),
];

export const updateEquipmentStatusValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid equipment ID'),
  body('status')
    .isIn(['DISPONIBLE', 'EN_LOCATION', 'EN_MAINTENANCE', 'MANQUANT'])
    .withMessage('Status must be one of: DISPONIBLE, EN_LOCATION, EN_MAINTENANCE, MANQUANT'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('related_event_id')
    .optional()
    .isUUID()
    .withMessage('Invalid event ID'),
  body('related_maintenance_id')
    .optional()
    .isUUID()
    .withMessage('Invalid maintenance ID'),
  body('notes')
    .optional()
    .trim(),
];

export const equipmentQueryValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('categoryId')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  query('subcategoryId')
    .optional()
    .isUUID()
    .withMessage('Invalid subcategory ID'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term must not be empty'),
  query('status')
    .optional()
    .isIn(['DISPONIBLE', 'EN_LOCATION', 'EN_MAINTENANCE', 'MANQUANT'])
    .withMessage('Invalid status filter'),
];
