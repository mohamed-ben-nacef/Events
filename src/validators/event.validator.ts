import { body, param, query, ValidationChain } from 'express-validator';

export const createEventValidator: ValidationChain[] = [
  body('event_name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Event name must be between 1 and 255 characters'),
  body('client_name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Client name must be between 1 and 255 characters'),
  body('contact_person')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Contact person must be between 1 and 255 characters'),
  body('phone')
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('address')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Address is required'),
  body('installation_date')
    .isISO8601()
    .toDate()
    .withMessage('Installation date must be a valid date (YYYY-MM-DD)'),
  body('event_date')
    .isISO8601()
    .toDate()
    .withMessage('Event date must be a valid date (YYYY-MM-DD)'),
  body('dismantling_date')
    .isISO8601()
    .toDate()
    .withMessage('Dismantling date must be a valid date (YYYY-MM-DD)'),
  body('category')
    .isIn(['SON', 'VIDEO', 'LUMIERE', 'MIXTE'])
    .withMessage('Category must be one of: SON, VIDEO, LUMIERE, MIXTE'),
  body('status')
    .optional()
    .isIn(['PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE'])
    .withMessage('Status must be one of: PLANIFIE, EN_COURS, TERMINE, ANNULE'),
  body('notes')
    .optional()
    .trim(),
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a non-negative number'),
  body('participant_count')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Participant count must be a non-negative integer'),
  body('event_type')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Event type must not exceed 100 characters'),
];

export const updateEventValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid event ID'),
  body('event_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Event name must be between 1 and 255 characters'),
  body('client_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Client name must be between 1 and 255 characters'),
  body('contact_person')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Contact person must be between 1 and 255 characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('address')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Address cannot be empty'),
  body('installation_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Installation date must be a valid date (YYYY-MM-DD)'),
  body('event_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Event date must be a valid date (YYYY-MM-DD)'),
  body('dismantling_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Dismantling date must be a valid date (YYYY-MM-DD)'),
  body('category')
    .optional()
    .isIn(['SON', 'VIDEO', 'LUMIERE', 'MIXTE'])
    .withMessage('Category must be one of: SON, VIDEO, LUMIERE, MIXTE'),
  body('status')
    .optional()
    .isIn(['PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE'])
    .withMessage('Status must be one of: PLANIFIE, EN_COURS, TERMINE, ANNULE'),
  body('notes')
    .optional()
    .trim(),
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a non-negative number'),
  body('participant_count')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Participant count must be a non-negative integer'),
  body('event_type')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Event type must not exceed 100 characters'),
];

export const eventIdValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid event ID'),
];

export const reserveEquipmentValidator: ValidationChain[] = [
  param('eventId')
    .isUUID()
    .withMessage('Invalid event ID'),
  body('equipment_id')
    .isUUID()
    .withMessage('Invalid equipment ID'),
  body('quantity_reserved')
    .isInt({ min: 1 })
    .withMessage('Quantity reserved must be at least 1'),
  body('notes')
    .optional()
    .trim(),
];

export const updateEquipmentReservationValidator: ValidationChain[] = [
  param('eventId')
    .isUUID()
    .withMessage('Invalid event ID'),
  param('reservationId')
    .isUUID()
    .withMessage('Invalid reservation ID'),
  body('quantity_reserved')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity reserved must be a non-negative integer'),
  body('quantity_returned')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity returned must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['RESERVE', 'LIVRE', 'RETOURNE'])
    .withMessage('Status must be one of: RESERVE, LIVRE, RETOURNE'),
  body('notes')
    .optional()
    .trim(),
];

export const returnEquipmentValidator: ValidationChain[] = [
  param('eventId')
    .isUUID()
    .withMessage('Invalid event ID'),
  param('reservationId')
    .isUUID()
    .withMessage('Invalid reservation ID'),
  body('quantity_returned')
    .isInt({ min: 1 })
    .withMessage('Quantity returned must be at least 1'),
  body('notes')
    .optional()
    .trim(),
];

export const assignTechnicianValidator: ValidationChain[] = [
  param('eventId')
    .isUUID()
    .withMessage('Invalid event ID'),
  body('technician_id')
    .isUUID()
    .withMessage('Invalid technician ID'),
  body('role')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Role must not exceed 100 characters'),
];

export const eventQueryValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE'])
    .withMessage('Invalid status filter'),
  query('category')
    .optional()
    .isIn(['SON', 'VIDEO', 'LUMIERE', 'MIXTE'])
    .withMessage('Invalid category filter'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid date (YYYY-MM-DD)'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid date (YYYY-MM-DD)'),
];
