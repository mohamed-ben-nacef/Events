import { body, param, query, ValidationChain } from 'express-validator';

export const createVehicleValidator: ValidationChain[] = [
  body('registration_number')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Registration number must be between 1 and 50 characters'),
  body('type')
    .isIn(['CAMION', 'UTILITAIRE', 'VOITURE'])
    .withMessage('Type must be one of: CAMION, UTILITAIRE, VOITURE'),
  body('brand')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand must be between 1 and 100 characters'),
  body('model')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Model must be between 1 and 100 characters'),
  body('load_capacity_kg')
    .isFloat({ min: 0 })
    .withMessage('Load capacity must be a non-negative number'),
  body('cargo_dimensions')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Cargo dimensions must not exceed 100 characters'),
  body('photo_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Photo URL must be a valid URL')
    .isLength({ max: 500 })
    .withMessage('Photo URL must not exceed 500 characters'),
  body('insurance_expiry')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Insurance expiry must be a valid date (YYYY-MM-DD)'),
  body('technical_inspection_expiry')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Technical inspection expiry must be a valid date (YYYY-MM-DD)'),
  body('fuel_type')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Fuel type must not exceed 50 characters'),
  body('current_mileage')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current mileage must be a non-negative integer'),
];

export const updateVehicleValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid vehicle ID'),
  body('registration_number')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Registration number must be between 1 and 50 characters'),
  body('type')
    .optional()
    .isIn(['CAMION', 'UTILITAIRE', 'VOITURE'])
    .withMessage('Type must be one of: CAMION, UTILITAIRE, VOITURE'),
  body('brand')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand must be between 1 and 100 characters'),
  body('model')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Model must be between 1 and 100 characters'),
  body('load_capacity_kg')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Load capacity must be a non-negative number'),
  body('cargo_dimensions')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Cargo dimensions must not exceed 100 characters'),
  body('photo_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Photo URL must be a valid URL')
    .isLength({ max: 500 })
    .withMessage('Photo URL must not exceed 500 characters'),
  body('insurance_expiry')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Insurance expiry must be a valid date (YYYY-MM-DD)'),
  body('technical_inspection_expiry')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Technical inspection expiry must be a valid date (YYYY-MM-DD)'),
  body('fuel_type')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Fuel type must not exceed 50 characters'),
  body('current_mileage')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current mileage must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['DISPONIBLE', 'EN_SERVICE', 'EN_MAINTENANCE'])
    .withMessage('Status must be one of: DISPONIBLE, EN_SERVICE, EN_MAINTENANCE'),
];

export const vehicleIdValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid vehicle ID'),
];

export const createTransportValidator: ValidationChain[] = [
  body('event_id')
    .isUUID()
    .withMessage('Invalid event ID'),
  body('vehicle_id')
    .isUUID()
    .withMessage('Invalid vehicle ID'),
  body('driver_id')
    .isUUID()
    .withMessage('Invalid driver ID'),
  body('departure_address')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Departure address is required'),
  body('arrival_address')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Arrival address is required'),
  body('departure_date')
    .isISO8601()
    .toDate()
    .withMessage('Departure date must be a valid datetime (ISO 8601)'),
  body('return_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Return date must be a valid datetime (ISO 8601)'),
  body('departure_mileage')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Departure mileage must be a non-negative integer'),
  body('total_weight_kg')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total weight must be a non-negative number'),
];

export const updateTransportStatusValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid transport ID'),
  body('status')
    .isIn(['PLANIFIE', 'EN_ROUTE', 'LIVRE', 'RETOUR', 'TERMINE'])
    .withMessage('Status must be one of: PLANIFIE, EN_ROUTE, LIVRE, RETOUR, TERMINE'),
  body('arrival_mileage')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Arrival mileage must be a non-negative integer'),
  body('return_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Return date must be a valid datetime (ISO 8601)'),
  body('fuel_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fuel cost must be a non-negative number'),
  body('incidents')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim(),
];

export const completeTransportValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid transport ID'),
  body('return_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Return date must be a valid datetime (ISO 8601)'),
  body('arrival_mileage')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Arrival mileage must be a non-negative integer'),
  body('fuel_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fuel cost must be a non-negative number'),
  body('incidents')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim(),
];

export const transportIdValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid transport ID'),
];

export const transportQueryValidator: ValidationChain[] = [
  query('eventId')
    .optional()
    .isUUID()
    .withMessage('Invalid event ID'),
  query('vehicleId')
    .optional()
    .isUUID()
    .withMessage('Invalid vehicle ID'),
  query('driverId')
    .optional()
    .isUUID()
    .withMessage('Invalid driver ID'),
  query('status')
    .optional()
    .isIn(['PLANIFIE', 'EN_ROUTE', 'LIVRE', 'RETOUR', 'TERMINE'])
    .withMessage('Invalid status filter'),
];
