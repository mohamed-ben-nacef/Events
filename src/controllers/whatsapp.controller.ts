import { Request, Response, NextFunction } from 'express';
import WhatsappMessage from '../models/WhatsappMessage';
import Event from '../models/Event';
import EventTechnician from '../models/EventTechnician';
import User from '../models/User';
import {
  NotFoundError,
  ValidationError,
} from '../utils/errors';
import { asyncHandler } from '../middleware/errorHandler';
import { Op } from 'sequelize';
// Note: Twilio integration would go here in production

// Get all WhatsApp messages
export const getAllWhatsAppMessages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (req.query.eventId) {
      whereClause.event_id = req.query.eventId;
    }
    if (req.query.status) {
      whereClause.status = req.query.status;
    }
    if (req.query.recipientPhone) {
      whereClause.recipient_phone = req.query.recipientPhone;
    }

    const { count, rows } = await WhatsappMessage.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'event_name', 'event_date'],
          required: false,
        },
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
      limit,
      offset,
      order: [['sent_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        messages: rows,
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

// Get message by ID
export const getWhatsAppMessageById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const message = await WhatsappMessage.findByPk(id, {
      include: [
        {
          model: Event,
          as: 'event',
        },
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    res.json({
      success: true,
      data: {
        message,
      },
    });
  }
);

// Send WhatsApp message
export const sendWhatsAppMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const {
      recipient_phone,
      recipient_name,
      message_content,
      message_type,
      event_id,
    } = req.body;

    // Verify event exists if provided
    if (event_id) {
      const event = await Event.findByPk(event_id);
      if (!event) {
        throw new NotFoundError('Event not found');
      }
    }

    // Create message record
    const message = await WhatsappMessage.create({
      recipient_phone,
      recipient_name,
      message_content,
      message_type: message_type || undefined,
      event_id: event_id || undefined,
      status: 'ENVOYE',
      sent_by: req.user.id,
    });

    // TODO: Integrate with Twilio API to actually send message
    // For now, we'll simulate sending
    try {
      // In production, this would call Twilio API
      // const twilioResponse = await twilioClient.messages.create({...});
      // await message.update({
      //   twilio_message_sid: twilioResponse.sid,
      //   status: 'ENVOYE',
      // });

      // Simulate success for now
      await message.update({
        twilio_message_sid: `SM${Date.now()}`,
        status: 'ENVOYE',
      });

      console.log(`📱 WhatsApp message sent to ${recipient_phone}: ${message_content.substring(0, 50)}...`);
    } catch (error: any) {
      await message.update({
        status: 'ECHOUE',
        error_message: error.message,
      });
      throw new ValidationError(`Failed to send WhatsApp message: ${error.message}`);
    }

    // Fetch with relations
    const messageWithRelations = await WhatsappMessage.findByPk(message.id, {
      include: [
        {
          model: Event,
          as: 'event',
        },
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'WhatsApp message sent successfully',
      data: {
        message: messageWithRelations,
      },
    });
  }
);

// Send event invitation to all technicians
export const sendEventInvitation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const { event_id, custom_message } = req.body;

    // Verify event exists
    const event = await Event.findByPk(event_id, {
      include: [
        {
          model: EventTechnician,
          as: 'technician_assignments',
          include: [
            {
              model: User,
              as: 'technician',
            },
          ],
        },
      ],
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const technicians = (event as any).technician_assignments || [];
    if (technicians.length === 0) {
      throw new ValidationError('No technicians assigned to this event');
    }

    const messages = [];
    for (const assignment of technicians) {
      const technician = (assignment as any).technician;
      const messageContent = custom_message
        ? `${custom_message}\n\nEvent: ${event.event_name}\nDate: ${event.event_date}\nLocation: ${event.address}`
        : `You are assigned to event: ${event.event_name}\nDate: ${event.event_date}\nLocation: ${event.address}\nPlease confirm your availability.`;

      const message = await WhatsappMessage.create({
        recipient_phone: technician.phone,
        recipient_name: technician.full_name,
        message_content: messageContent,
        message_type: 'INVITATION',
        event_id: event.id,
        status: 'ENVOYE',
        sent_by: req.user.id,
      });

      // TODO: Send via Twilio
      await message.update({
        twilio_message_sid: `SM${Date.now()}-${technician.id}`,
      });

      messages.push(message);
    }

    res.json({
      success: true,
      message: `Invitations sent to ${messages.length} technicians`,
      data: {
        messages_sent: messages.length,
        messages: messages.map((m) => ({
          id: m.id,
          recipient_name: m.recipient_name,
          status: m.status,
        })),
      },
    });
  }
);

// Send event reminder
export const sendEventReminder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const { event_id, reminder_hours = 24 } = req.body;

    const event = await Event.findByPk(event_id, {
      include: [
        {
          model: EventTechnician,
          as: 'technician_assignments',
          include: [
            {
              model: User,
              as: 'technician',
            },
          ],
        },
      ],
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const technicians = (event as any).technician_assignments || [];
    const messages = [];

    for (const assignment of technicians) {
      const technician = (assignment as any).technician;
      const messageContent = `Reminder: Event "${event.event_name}" is in ${reminder_hours} hours.\nDate: ${event.event_date}\nLocation: ${event.address}\nPlease be prepared.`;

      const message = await WhatsappMessage.create({
        recipient_phone: technician.phone,
        recipient_name: technician.full_name,
        message_content: messageContent,
        message_type: 'RAPPEL',
        event_id: event.id,
        status: 'ENVOYE',
        sent_by: req.user.id,
      });

      // TODO: Send via Twilio
      await message.update({
        twilio_message_sid: `SM${Date.now()}-${technician.id}`,
      });

      messages.push(message);
    }

    res.json({
      success: true,
      message: `Reminders sent to ${messages.length} technicians`,
      data: {
        messages_sent: messages.length,
      },
    });
  }
);

// Update message status (webhook for Twilio)
export const updateMessageStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { MessageSid, MessageStatus } = req.body;

    if (!MessageSid) {
      throw new ValidationError('MessageSid is required');
    }

    const message = await WhatsappMessage.findOne({
      where: { twilio_message_sid: MessageSid },
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    let status = 'ENVOYE';
    const updateData: any = {};

    switch (MessageStatus) {
      case 'delivered':
        status = 'LIVRE';
        updateData.delivered_at = new Date();
        break;
      case 'read':
        status = 'LU';
        updateData.read_at = new Date();
        break;
      case 'failed':
      case 'undelivered':
        status = 'ECHOUE';
        updateData.error_message = `Message failed: ${MessageStatus}`;
        break;
    }

    await message.update({
      status,
      ...updateData,
    });

    res.json({
      success: true,
      message: 'Status updated',
    });
  }
);

// Get messages by event
export const getMessagesByEvent = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const eventId = req.params.eventId as string;

    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const messages = await WhatsappMessage.findAll({
      where: { event_id: eventId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
      order: [['sent_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        event: {
          id: event.id,
          event_name: event.event_name,
        },
        messages,
      },
    });
  }
);
