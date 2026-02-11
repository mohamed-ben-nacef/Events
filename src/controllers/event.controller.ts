import { Request, Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import {
  User,
  Category,
  Subcategory,
  Equipment,
  EquipmentStatus,
  Event,
  EventEquipment,
  EventTechnician
} from '../models';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from '../utils/errors';
import { asyncHandler } from '../middleware/errorHandler';
import { Op } from 'sequelize';

// Get all events with pagination and filtering
export const getAllEvents = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    if (req.query.status) {
      whereClause.status = req.query.status;
    }
    if (req.query.category) {
      whereClause.category = req.query.category;
    }
    if (req.query.dateFrom || req.query.dateTo) {
      whereClause.event_date = {};
      if (req.query.dateFrom) {
        whereClause.event_date[Op.gte] = req.query.dateFrom;
      }
      if (req.query.dateTo) {
        whereClause.event_date[Op.lte] = req.query.dateTo;
      }
    }

    const { count, rows } = await Event.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
      limit,
      offset,
      order: [['event_date', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        events: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  }
);

// Get event by ID
export const getEventById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    console.log(`Backend: Fetching event by ID: ${id}`);

    try {
      console.log(`Backend: Executing full findByPk for event ${id}`);
      const event = await Event.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'full_name', 'email'],
          },
          {
            model: EventEquipment,
            as: 'equipment_reservations',
            include: [
              {
                model: Equipment,
                as: 'equipment',
                include: [
                  {
                    model: Category,
                    as: 'category',
                  },
                  {
                    model: Subcategory,
                    as: 'subcategory',
                    required: false,
                  },
                ],
              },
            ],
          },
          {
            model: EventTechnician,
            as: 'technician_assignments',
            include: [
              {
                model: User,
                as: 'technician',
                attributes: ['id', 'full_name', 'email', 'phone'],
              },
            ],
          },
        ],
      });
      console.log(`Backend: findByPk successful for event ${id}`);

      if (!event) {
        console.log(`Backend: Event not found with ID: ${id}`);
        throw new NotFoundError('Event not found');
      }

      console.log(`Backend: Event fetched successfully: ${event.id}`);
      res.json({
        success: true,
        data: {
          event,
        },
      });
    } catch (error: any) {
      console.error(`Backend: Error fetching event ${id}:`, error);
      next(error);
    }
  }
);

// Create event
export const createEvent = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const {
      event_name,
      client_name,
      contact_person,
      phone,
      email,
      address,
      installation_date,
      event_date,
      dismantling_date,
      category,
      status = 'PLANIFIE',
      notes,
      budget,
      participant_count,
      event_type,
    } = req.body;

    // Validate dates: installation_date <= event_date <= dismantling_date
    const installDate = new Date(installation_date);
    const eventDate = new Date(event_date);
    const dismantleDate = new Date(dismantling_date);

    if (installDate > eventDate) {
      throw new ValidationError('Installation date must be before or on event date');
    }
    if (eventDate > dismantleDate) {
      throw new ValidationError('Event date must be before or on dismantling date');
    }

    // Create event
    const event = await Event.create({
      event_name,
      client_name,
      contact_person,
      phone,
      email: email || undefined,
      address,
      installation_date,
      event_date,
      dismantling_date,
      category,
      status,
      notes: notes || undefined,
      budget: budget || undefined,
      participant_count: participant_count || undefined,
      event_type: event_type || undefined,
      created_by: req.user.id,
    });

    // Fetch with creator
    const eventWithCreator = await Event.findByPk(event.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event: eventWithCreator,
      },
    });
  }
);

// Update event
export const updateEvent = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const updateData: any = {};

    const event = await Event.findByPk(id);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Build update data
    const allowedFields = [
      'event_name',
      'client_name',
      'contact_person',
      'phone',
      'email',
      'address',
      'installation_date',
      'event_date',
      'dismantling_date',
      'category',
      'status',
      'notes',
      'budget',
      'participant_count',
      'event_type',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Validate dates if being updated
    if (updateData.installation_date || updateData.event_date || updateData.dismantling_date) {
      const installDate = new Date(updateData.installation_date || event.installation_date);
      const eventDate = new Date(updateData.event_date || event.event_date);
      const dismantleDate = new Date(updateData.dismantling_date || event.dismantling_date);

      if (installDate > eventDate) {
        throw new ValidationError('Installation date must be before or on event date');
      }
      if (eventDate > dismantleDate) {
        throw new ValidationError('Event date must be before or on dismantling date');
      }
    }

    await event.update(updateData);

    // Fetch updated event
    const updatedEvent = await Event.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
    });

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: {
        event: updatedEvent,
      },
    });
  }
);

// Delete event
export const deleteEvent = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const event = await Event.findByPk(id);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Check if event is in progress
    if (event.status === 'EN_COURS') {
      throw new ValidationError('Cannot delete event that is currently in progress');
    }

    // Delete event (cascades to equipment reservations and technician assignments)
    await event.destroy();

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  }
);

// Reserve equipment for event
export const reserveEquipment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const eventId = req.params.eventId as string;
    const { equipment_id, quantity_reserved, notes } = req.body;

    // Verify event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Verify equipment exists
    const equipment = await Equipment.findByPk(equipment_id);
    if (!equipment) {
      throw new NotFoundError('Equipment not found');
    }

    // Check if equipment is in maintenance
    const maintenanceStatus = await EquipmentStatus.findOne({
      where: {
        equipment_id,
        status: 'EN_MAINTENANCE',
      },
      order: [['changed_at', 'DESC']],
    });

    if (maintenanceStatus) {
      throw new ValidationError(
        `Equipment "${equipment.name}" is currently under maintenance and cannot be reserved.`
      );
    }

    // Check available quantity
    if (quantity_reserved > equipment.quantity_available) {
      throw new ValidationError(
        `Insufficient quantity available. Requested: ${quantity_reserved}, Available: ${equipment.quantity_available}`
      );
    }

    // Check if equipment is already reserved for this event
    const existingReservation = await EventEquipment.findOne({
      where: {
        event_id: eventId,
        equipment_id,
      },
    });

    if (existingReservation) {
      throw new ConflictError('Equipment is already reserved for this event. Use update endpoint to modify quantity.');
    }

    // Create reservation
    const reservation = await EventEquipment.create({
      event_id: eventId,
      equipment_id,
      quantity_reserved,
      quantity_returned: 0,
      status: 'RESERVE',
      notes: notes || undefined,
    });

    // Update equipment status
    const newAvailable = equipment.quantity_available - quantity_reserved;
    await equipment.update({
      quantity_available: newAvailable,
    });

    // Create equipment status entry
    await EquipmentStatus.create({
      equipment_id,
      status: 'EN_LOCATION',
      quantity: quantity_reserved,
      related_event_id: eventId,
      changed_by: req.user.id,
      notes: `Reserved for event: ${event.event_name}`,
    });

    // Fetch reservation with equipment
    const reservationWithEquipment = await EventEquipment.findByPk(reservation.id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
          include: [
            {
              model: Category,
              as: 'category',
            },
          ],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Equipment reserved successfully',
      data: {
        reservation: reservationWithEquipment,
      },
    });
  }
);

// Update equipment reservation
export const updateEquipmentReservation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const eventId = req.params.eventId as string;
    const reservationId = req.params.reservationId as string;
    const { quantity_reserved, quantity_returned, status, notes } = req.body;

    const reservation = await EventEquipment.findOne({
      where: {
        id: reservationId,
        event_id: eventId,
      },
      include: [
        {
          model: Equipment,
          as: 'equipment',
        },
      ],
    });

    if (!reservation) {
      throw new NotFoundError('Reservation not found');
    }

    const equipment = (reservation as any).equipment;
    const updateData: any = {};

    // Update quantity_reserved
    if (quantity_reserved !== undefined) {
      if (quantity_reserved < reservation.quantity_returned) {
        throw new ValidationError('Quantity reserved cannot be less than quantity returned');
      }

      const quantityDifference = quantity_reserved - reservation.quantity_reserved;
      const newAvailable = equipment.quantity_available - quantityDifference;

      if (newAvailable < 0) {
        throw new ValidationError(
          `Insufficient quantity available. Cannot increase reservation by ${quantityDifference}`
        );
      }

      updateData.quantity_reserved = quantity_reserved;
      await equipment.update({ quantity_available: newAvailable });
    }

    // Update quantity_returned
    if (quantity_returned !== undefined) {
      if (quantity_returned > reservation.quantity_reserved) {
        throw new ValidationError('Quantity returned cannot exceed quantity reserved');
      }
      updateData.quantity_returned = quantity_returned;

      // If all returned, update status
      if (quantity_returned === reservation.quantity_reserved) {
        updateData.status = 'RETOURNE';
      }
    }

    // Update status
    if (status) {
      updateData.status = status;
    }

    // Update notes
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    await reservation.update(updateData);

    // Fetch updated reservation
    const updatedReservation = await EventEquipment.findByPk(reservationId, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
        },
      ],
    });

    res.json({
      success: true,
      message: 'Reservation updated successfully',
      data: {
        reservation: updatedReservation,
      },
    });
  }
);

// Remove equipment reservation
export const removeEquipmentReservation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const eventId = req.params.eventId as string;
    const reservationId = req.params.reservationId as string;

    const reservation = await EventEquipment.findOne({
      where: {
        id: reservationId,
        event_id: eventId,
      },
      include: [
        {
          model: Equipment,
          as: 'equipment',
        },
      ],
    });

    if (!reservation) {
      throw new NotFoundError('Reservation not found');
    }

    const equipment = (reservation as any).equipment;

    // Restore equipment available quantity
    const newAvailable = Math.min(
      equipment.quantity_total,
      equipment.quantity_available + reservation.quantity_reserved
    );
    await equipment.update({ quantity_available: newAvailable });

    // Create equipment status entry
    await EquipmentStatus.create({
      equipment_id: equipment.id,
      status: 'DISPONIBLE',
      quantity: reservation.quantity_reserved,
      related_event_id: eventId,
      changed_by: req.user.id,
      notes: `Reservation removed for event: ${eventId}`,
    });

    // Delete reservation
    await reservation.destroy();

    res.json({
      success: true,
      message: 'Equipment reservation removed successfully',
    });
  }
);

// Return equipment
export const returnEquipment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const eventId = req.params.eventId as string;
    const reservationId = req.params.reservationId as string;
    const { quantity_returned, notes } = req.body;

    const reservation = await EventEquipment.findOne({
      where: {
        id: reservationId,
        event_id: eventId,
      },
      include: [
        {
          model: Equipment,
          as: 'equipment',
        },
      ],
    });

    if (!reservation) {
      throw new NotFoundError('Reservation not found');
    }

    const equipment = (reservation as any).equipment;
    const newReturned = reservation.quantity_returned + quantity_returned;

    if (newReturned > reservation.quantity_reserved) {
      throw new ValidationError(
        `Cannot return ${quantity_returned} items. Only ${reservation.quantity_reserved - reservation.quantity_returned} items can be returned.`
      );
    }

    // Update reservation
    const updateData: any = {
      quantity_returned: newReturned,
      notes: notes || reservation.notes,
    };

    if (newReturned === reservation.quantity_reserved) {
      updateData.status = 'RETOURNE';
    }

    await reservation.update(updateData);

    // Update equipment available quantity
    const newAvailable = Math.min(
      equipment.quantity_total,
      equipment.quantity_available + quantity_returned
    );
    await equipment.update({ quantity_available: newAvailable });

    // Create equipment status entry
    await EquipmentStatus.create({
      equipment_id: equipment.id,
      status: newReturned === reservation.quantity_reserved ? 'DISPONIBLE' : 'EN_LOCATION',
      quantity: quantity_returned,
      related_event_id: eventId,
      changed_by: req.user.id,
      notes: `Returned ${quantity_returned} items from event`,
    });

    // Fetch updated reservation
    const updatedReservation = await EventEquipment.findByPk(reservationId, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
        },
      ],
    });

    res.json({
      success: true,
      message: 'Equipment returned successfully',
      data: {
        reservation: updatedReservation,
      },
    });
  }
);

// Assign technician to event
export const assignTechnician = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const eventId = req.params.eventId as string;
    const { technician_id, role } = req.body;

    // Verify event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Verify technician exists and is active
    const technician = await User.findByPk(technician_id);
    if (!technician) {
      throw new NotFoundError('Technician not found');
    }

    if (!technician.is_active) {
      throw new ValidationError('Technician account is not active');
    }

    // Check if already assigned
    const existingAssignment = await EventTechnician.findOne({
      where: {
        event_id: eventId,
        technician_id,
      },
    });

    if (existingAssignment) {
      throw new ConflictError('Technician is already assigned to this event');
    }

    // Create assignment
    const assignment = await EventTechnician.create({
      event_id: eventId,
      technician_id,
      role: role || undefined,
      is_prepared: false,
    });

    // Fetch with technician info
    const assignmentWithTechnician = await EventTechnician.findByPk(assignment.id, {
      include: [
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'full_name', 'email', 'phone'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Technician assigned successfully',
      data: {
        assignment: assignmentWithTechnician,
      },
    });
  }
);

// Mark technician as prepared
export const markTechnicianPrepared = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const eventId = req.params.eventId as string;
    const assignmentId = req.params.assignmentId as string;

    const assignment = await EventTechnician.findOne({
      where: {
        id: assignmentId,
        event_id: eventId,
      },
    });

    if (!assignment) {
      throw new NotFoundError('Assignment not found');
    }

    await assignment.update({
      is_prepared: true,
      prepared_at: new Date(),
    });

    res.json({
      success: true,
      message: 'Technician marked as prepared',
      data: {
        assignment,
      },
    });
  }
);

// Remove technician from event
export const removeTechnician = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const eventId = req.params.eventId as string;
    const assignmentId = req.params.assignmentId as string;

    const assignment = await EventTechnician.findOne({
      where: {
        id: assignmentId,
        event_id: eventId,
      },
    });

    if (!assignment) {
      throw new NotFoundError('Assignment not found');
    }

    await assignment.destroy();

    res.json({
      success: true,
      message: 'Technician removed from event',
    });
  }
);

// Get all equipment for an event
export const getEventEquipment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const eventId = req.params.eventId as string;
    console.log(`Backend: Fetching equipment for event: ${eventId}`);

    try {
      const eventEquipment = await EventEquipment.findAll({
        where: { event_id: eventId },
        include: [
          {
            model: Equipment,
            as: 'equipment',
            include: [
              {
                model: Category,
                as: 'category',
              },
              {
                model: Subcategory,
                as: 'subcategory',
              },
            ],
          },
        ],
      });

      res.json({
        success: true,
        data: {
          equipment: eventEquipment,
        },
      });
    } catch (error: any) {
      console.error(`Backend: Error fetching event equipment for ${eventId}:`, error);
      next(error);
    }
  }
);

// Get all technicians for an event
export const getEventTechnicians = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const eventId = req.params.eventId as string;

    const assignments = await EventTechnician.findAll({
      where: { event_id: eventId },
      include: [
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'full_name', 'email', 'phone'],
        },
      ],
    });

    res.json({
      success: true,
      data: {
        assignments,
      },
    });
  }
);

// Generate Event Documents (PDF)
export const getEventDocuments = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const type = req.params.type as string;

    const event = await Event.findByPk(id, {
      include: [
        {
          model: EventEquipment,
          as: 'equipment_reservations',
          include: [{ model: Equipment, as: 'equipment' }]
        },
        {
          model: EventTechnician,
          as: 'technician_assignments',
          include: [{ model: User, as: 'technician', attributes: ['full_name'] }]
        }
      ]
    });

    if (!event) throw new NotFoundError('Event not found');

    const doc = new PDFDocument({ margin: 50 });
    let filename = `Document_${type}_${event.event_name.replace(/\s+/g, '_')}.pdf`;

    // Header
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // --- DESIGN ---
    // Shop Logo / Name
    doc.fillColor('#1e293b').fontSize(24).text('MARABOUT EVENTS', { align: 'right' });
    doc.fontSize(10).text('Service Logistique & Technique', { align: 'right' });
    doc.moveDown(2);

    // Document Title
    const titleMap: Record<string, string> = {
      'picking-list': 'LISTE DE COLLISAGE / PICKING LIST',
      'plan-de-feu': 'PLAN DE FEU TECHNIQUE',
      'bon-sortie': 'BON DE SORTIE MATÉRIEL',
      'BON_SORTIE': 'BON DE SORTIE MATÉRIEL',
      'BON_RETOUR': 'BON DE RETOUR MATÉRIEL',
      'FICHE_MATERIEL': 'FICHE TECHNIQUE RÉCAPITULATIVE'
    };

    doc.rect(50, doc.y, 500, 40).fill('#f8fafc');
    doc.fillColor('#0f172a').fontSize(16).text(titleMap[type] || 'DOCUMENT ÉVÈNEMENT', 60, doc.y + 12, { characterSpacing: 1 });
    doc.moveDown(3);

    // Event Details Grid
    const startY = doc.y;
    doc.fillColor('#64748b').fontSize(9).text('ÉVÈNEMENT:', 50, startY);
    doc.fillColor('#1e293b').fontSize(11).text(event.event_name, 150, startY);

    doc.fillColor('#64748b').fontSize(9).text('CLIENT:', 50, startY + 20);
    doc.fillColor('#1e293b').fontSize(11).text(event.client_name, 150, startY + 20);

    doc.fillColor('#64748b').fontSize(9).text('DATE:', 50, startY + 40);
    doc.fillColor('#1e293b').fontSize(11).text(new Date(event.event_date).toLocaleDateString('fr-FR'), 150, startY + 40);

    doc.fillColor('#64748b').fontSize(9).text('LIEU:', 350, startY);
    doc.fillColor('#1e293b').fontSize(11).text(event.address, 420, startY, { width: 130 });

    doc.moveDown(4);

    // Equipment Table Header
    doc.rect(50, doc.y, 500, 20).fill('#1e293b');
    doc.fillColor('#ffffff').fontSize(10).text('MATÉRIEL / ÉQUIPEMENT', 60, doc.y + 5);
    doc.text('REQUIS', 400, doc.y - 10);
    doc.text('VÉRIF', 480, doc.y - 10);
    doc.moveDown(1.5);

    // Table Content
    (event as any).equipment_reservations?.forEach((res: any, index: number) => {
      const itemY = doc.y;
      if (itemY > 700) doc.addPage();

      const item = res.equipment;
      doc.fillColor(index % 2 === 0 ? '#1e293b' : '#334155').fontSize(10);
      doc.text(item.name, 60, itemY + 5);

      doc.fontSize(7).fillColor('#64748b').text(`${item.brand || ''} ${item.model || ''}`, 60, doc.y + 2);

      doc.fillColor('#1e293b').fontSize(10).text(res.quantity_reserved.toString(), 400, itemY + 8);

      // Verification box
      doc.rect(480, itemY + 5, 15, 15).strokeColor('#cbd5e1').lineWidth(1).stroke();

      // Line separator
      doc.moveTo(50, doc.y + 10).lineTo(550, doc.y + 10).strokeColor('#f1f5f9').lineWidth(0.5).stroke();
      doc.moveDown(2);
    });

    // Footer / Signatures
    const footY = 700;
    doc.moveTo(50, footY).lineTo(550, footY).strokeColor('#000000').lineWidth(1).stroke();

    doc.fillColor('#64748b').fontSize(9).text('Visa Logistique', 50, footY + 10);
    doc.text('Signature Client', 450, footY + 10);

    doc.fontSize(8).text('Généré automatiquement par Events Manager PRO', 50, 750, { align: 'center' });

    doc.end();
  }
);
