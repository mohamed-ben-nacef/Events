import { Router } from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  reserveEquipment,
  updateEquipmentReservation,
  returnEquipment,
  assignTechnician,
  markTechnicianPrepared,
  removeTechnician,
  removeEquipmentReservation,
  getEventEquipment,
  getEventTechnicians,
  getEventDocuments,
} from '../controllers/event.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createEventValidator,
  updateEventValidator,
  eventIdValidator,
  reserveEquipmentValidator,
  updateEquipmentReservationValidator,
  returnEquipmentValidator,
  assignTechnicianValidator,
  eventQueryValidator,
} from '../validators/event.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Event routes
router.get(
  '/',
  validate(eventQueryValidator),
  getAllEvents
);
router.get(
  '/:id',
  validate(eventIdValidator),
  getEventById
);
router.post(
  '/',
  validate(createEventValidator),
  createEvent
);
router.put(
  '/:id',
  validate(updateEventValidator),
  updateEvent
);
router.delete(
  '/:id',
  authorize('ADMIN'),
  validate(eventIdValidator),
  deleteEvent
);

// Equipment reservation routes
router.get(
  '/:eventId/equipment',
  getEventEquipment
);
router.post(
  '/:eventId/equipment',
  validate(reserveEquipmentValidator),
  reserveEquipment
);
router.put(
  '/:eventId/equipment/:reservationId',
  validate(updateEquipmentReservationValidator),
  updateEquipmentReservation
);
router.post(
  '/:eventId/equipment/:reservationId/return',
  validate(returnEquipmentValidator),
  returnEquipment
);
router.delete(
  '/:eventId/equipment/:reservationId',
  removeEquipmentReservation
);

// Technician assignment routes
router.get(
  '/:eventId/technicians',
  getEventTechnicians
);
router.post(
  '/:eventId/technicians',
  validate(assignTechnicianValidator),
  assignTechnician
);
router.put(
  '/:eventId/technicians/:assignmentId/prepare',
  markTechnicianPrepared
);
router.delete(
  '/:eventId/technicians/:assignmentId',
  removeTechnician
);

// Document routes
router.get(
  '/:id/documents/:type',
  validate(eventIdValidator),
  getEventDocuments
);

export default router;
