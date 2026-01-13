import { body, param, query, ValidationChain } from 'express-validator';

export const sendWhatsAppMessageValidator: ValidationChain[] = [
  body('recipient_phone')
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Recipient phone must be between 10 and 20 characters')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Please provide a valid phone number'),
  body('recipient_name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Recipient name must be between 1 and 255 characters'),
  body('message_content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Message content is required'),
  body('message_type')
    .optional()
    .isIn(['INVITATION', 'RAPPEL', 'NOTIFICATION'])
    .withMessage('Message type must be one of: INVITATION, RAPPEL, NOTIFICATION'),
  body('event_id')
    .optional()
    .isUUID()
    .withMessage('Invalid event ID'),
];

export const sendEventInvitationValidator: ValidationChain[] = [
  body('event_id')
    .isUUID()
    .withMessage('Invalid event ID'),
  body('custom_message')
    .optional()
    .trim(),
];

export const sendEventReminderValidator: ValidationChain[] = [
  body('event_id')
    .isUUID()
    .withMessage('Invalid event ID'),
  body('reminder_hours')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Reminder hours must be a positive integer'),
];

export const whatsappMessageIdValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid message ID'),
];

export const whatsappQueryValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('eventId')
    .optional()
    .isUUID()
    .withMessage('Invalid event ID'),
  query('status')
    .optional()
    .isIn(['ENVOYE', 'LIVRE', 'LU', 'ECHOUE'])
    .withMessage('Invalid status filter'),
  query('recipientPhone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Invalid phone number format'),
];
