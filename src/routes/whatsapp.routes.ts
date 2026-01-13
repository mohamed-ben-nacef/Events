import { Router } from 'express';
import {
  getAllWhatsAppMessages,
  getWhatsAppMessageById,
  sendWhatsAppMessage,
  sendEventInvitation,
  sendEventReminder,
  updateMessageStatus,
  getMessagesByEvent,
} from '../controllers/whatsapp.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  sendWhatsAppMessageValidator,
  sendEventInvitationValidator,
  sendEventReminderValidator,
  whatsappMessageIdValidator,
  whatsappQueryValidator,
} from '../validators/whatsapp.validator';

const router = Router();

// Public webhook route (no auth required for Twilio)
router.post('/webhook', updateMessageStatus);

// All other routes require authentication
router.use(authenticate);

// WhatsApp message routes
router.get(
  '/',
  validate(whatsappQueryValidator),
  getAllWhatsAppMessages
);
router.get(
  '/:id',
  validate(whatsappMessageIdValidator),
  getWhatsAppMessageById
);
router.post(
  '/',
  validate(sendWhatsAppMessageValidator),
  sendWhatsAppMessage
);
router.post(
  '/event-invitation',
  validate(sendEventInvitationValidator),
  sendEventInvitation
);
router.post(
  '/event-reminder',
  validate(sendEventReminderValidator),
  sendEventReminder
);
router.get(
  '/events/:eventId',
  getMessagesByEvent
);

export default router;
