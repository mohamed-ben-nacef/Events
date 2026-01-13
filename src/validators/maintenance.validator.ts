import { body, param, query, ValidationChain } from 'express-validator';

export const createMaintenanceValidator: ValidationChain[] = [
  body('equipment_id')
    .isUUID()
    .withMessage('Invalid equipment ID'),
  body('problem_description')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Problem description is required'),
  body('technician_id')
    .isUUID()
    .withMessage('Invalid technician ID'),
  body('priority')
    .optional()
    .isIn(['BASSE', 'MOYENNE', 'HAUTE'])
    .withMessage('Priority must be one of: BASSE, MOYENNE, HAUTE'),
  body('start_date')
    .isISO8601()
    .toDate()
    .withMessage('Start date must be a valid date (YYYY-MM-DD)'),
  body('expected_end_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Expected end date must be a valid date (YYYY-MM-DD)'),
  body('photos')
    .optional()
    .isArray()
    .withMessage('Photos must be an array'),
  body('photos.*')
    .optional()
    .isURL()
    .withMessage('Each photo must be a valid URL'),
];

export const updateMaintenanceValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid maintenance ID'),
  body('problem_description')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Problem description cannot be empty'),
  body('technician_id')
    .optional()
    .isUUID()
    .withMessage('Invalid technician ID'),
  body('priority')
    .optional()
    .isIn(['BASSE', 'MOYENNE', 'HAUTE'])
    .withMessage('Priority must be one of: BASSE, MOYENNE, HAUTE'),
  body('expected_end_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Expected end date must be a valid date (YYYY-MM-DD)'),
  body('actual_end_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Actual end date must be a valid date (YYYY-MM-DD)'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number'),
  body('status')
    .optional()
    .isIn(['EN_ATTENTE', 'EN_COURS', 'TERMINE'])
    .withMessage('Status must be one of: EN_ATTENTE, EN_COURS, TERMINE'),
  body('solution_description')
    .optional()
    .trim(),
  body('photos')
    .optional()
    .isArray()
    .withMessage('Photos must be an array'),
  body('photos.*')
    .optional()
    .isURL()
    .withMessage('Each photo must be a valid URL'),
];

export const completeMaintenanceValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid maintenance ID'),
  body('actual_end_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Actual end date must be a valid date (YYYY-MM-DD)'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number'),
  body('solution_description')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Solution description is required'),
  body('photos')
    .optional()
    .isArray()
    .withMessage('Photos must be an array'),
  body('photos.*')
    .optional()
    .isURL()
    .withMessage('Each photo must be a valid URL'),
];

export const maintenanceIdValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid maintenance ID'),
];

export const maintenanceQueryValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('equipmentId')
    .optional()
    .isUUID()
    .withMessage('Invalid equipment ID'),
  query('technicianId')
    .optional()
    .isUUID()
    .withMessage('Invalid technician ID'),
  query('status')
    .optional()
    .isIn(['EN_ATTENTE', 'EN_COURS', 'TERMINE'])
    .withMessage('Invalid status filter'),
  query('priority')
    .optional()
    .isIn(['BASSE', 'MOYENNE', 'HAUTE'])
    .withMessage('Invalid priority filter'),
];
