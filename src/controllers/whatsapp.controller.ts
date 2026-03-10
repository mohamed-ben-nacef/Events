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
import whatsappService from '../services/whatsapp.service';

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

    console.log('--- Send WhatsApp Request ---');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const {
      recipient_phone,
      recipient_name,
      message_content,
      template_name,
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

    // Send message using Meta service
    try {
      let metaResponse;
      if (template_name) {
        metaResponse = await whatsappService.sendTemplateMessage(recipient_phone, template_name);
        // If it's a template, update content with placeholder if empty
        if (!message_content) {
          await message.update({ message_content: `[Template: ${template_name}]` });
        }
      } else {
        metaResponse = await whatsappService.sendMessage(recipient_phone, message_content);
      }

      await message.update({
        twilio_message_sid: metaResponse.id,
        status: metaResponse.status === 'failed' ? 'ECHOUE' : 'ENVOYE',
      });

      console.log(`📱 WhatsApp message sent to ${recipient_phone}: ${message_content.substring(0, 50)}...`);
    } catch (error: any) {
      await message.update({
        status: 'ECHOUE',
        error_message: error.message,
      });
      console.error(`Failed to send WhatsApp message to ${recipient_phone}:`, error.message);
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

      // Send via Twilio
      try {
        const metaResponse = await whatsappService.sendMessage(technician.phone, messageContent);
        await message.update({
          twilio_message_sid: metaResponse.id,
          status: metaResponse.status === 'failed' ? 'ECHOUE' : 'ENVOYE',
        });
      } catch (error: any) {
        await message.update({
          status: 'ECHOUE',
          error_message: error.message,
        });
      }

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

      // Send via Twilio
      try {
        const metaResponse = await whatsappService.sendMessage(technician.phone, messageContent);
        await message.update({
          twilio_message_sid: metaResponse.id,
          status: metaResponse.status === 'failed' ? 'ECHOUE' : 'ENVOYE',
        });
      } catch (error: any) {
        await message.update({
          status: 'ECHOUE',
          error_message: error.message,
        });
      }

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

// Verify webhook (GET request from Meta)
export const verifyWebhook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('✅ WhatsApp Webhook verified');
      res.status(200).send(challenge);
    } else {
      res.status(403).json({ success: false, message: 'Verification failed' });
    }
  }
);

// Update message status (webhook for Meta)
export const updateMessageStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;

    // Meta sends multiple entries and changes
    if (body.object === 'whatsapp_business_account') {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.statuses &&
        body.entry[0].changes[0].value.statuses[0]
      ) {
        const { id, status: metaStatus } = body.entry[0].changes[0].value.statuses[0];

        const message = await WhatsappMessage.findOne({
          where: { twilio_message_sid: id },
        });

        if (message) {
          let status: 'ENVOYE' | 'LIVRE' | 'LU' | 'ECHOUE' = 'ENVOYE';
          const updateData: any = {};

          switch (metaStatus) {
            case 'delivered':
              status = 'LIVRE';
              updateData.delivered_at = new Date();
              break;
            case 'read':
              status = 'LU';
              updateData.read_at = new Date();
              break;
            case 'failed':
              status = 'ECHOUE';
              updateData.error_message = `Message failed: ${metaStatus}`;
              break;
            case 'sent':
              status = 'ENVOYE';
              break;
          }

          await message.update({
            status,
            ...updateData,
          });
        }
      }
      res.status(200).json({ success: true });
    } else {
      res.sendStatus(404);
    }
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
