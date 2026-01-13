import { query, param, ValidationChain } from 'express-validator';

export const activityLogQueryValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('userId')
    .optional()
    .isUUID()
    .withMessage('Invalid user ID'),
  query('action')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Action must not be empty'),
  query('entityType')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Entity type must not be empty'),
  query('entityId')
    .optional()
    .isUUID()
    .withMessage('Invalid entity ID'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid date (YYYY-MM-DD)'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid date (YYYY-MM-DD)'),
];

export const userIdValidator: ValidationChain[] = [
  param('userId')
    .isUUID()
    .withMessage('Invalid user ID'),
];

export const entityValidator: ValidationChain[] = [
  param('entityType')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Entity type is required'),
  param('entityId')
    .isUUID()
    .withMessage('Invalid entity ID'),
];
