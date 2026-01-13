# WhatsApp Messages Module API Documentation

## Overview
This module handles WhatsApp message sending, tracking, and notification management.

---

## WhatsApp Messages Endpoints

### 1. Get All WhatsApp Messages

**Endpoint:** `GET /api/whatsapp-messages`

**Description:** Retrieves all WhatsApp messages with filtering.

**Authentication:** Required

**Query Parameters:**
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 20)
- `eventId` (optional, UUID): Filter by event
- `status` (optional, string): Filter by status
- `recipientPhone` (optional, string): Filter by recipient phone

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "recipient_phone": "+1234567890",
        "recipient_name": "John Doe",
        "message_content": "You are assigned to event: Wedding Reception",
        "message_type": "INVITATION",
        "event_id": "uuid",
        "status": "ENVOYE",
        "twilio_message_sid": "SM1234567890",
        "error_message": null,
        "sent_by": "uuid",
        "sender": {
          "id": "uuid",
          "full_name": "Admin User"
        },
        "event": {...},
        "sent_at": "2024-01-15T10:30:00.000Z",
        "delivered_at": null,
        "read_at": null
      }
    ],
    "pagination": {...}
  }
}
```

---

### 2. Get Message by ID

**Endpoint:** `GET /api/whatsapp-messages/:id`

**Description:** Retrieves detailed information about a WhatsApp message.

**Authentication:** Required

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "uuid",
      "recipient_phone": "+1234567890",
      "recipient_name": "John Doe",
      "message_content": "You are assigned to event: Wedding Reception",
      "message_type": "INVITATION",
      "event_id": "uuid",
      "status": "LIVRE",
      "twilio_message_sid": "SM1234567890",
      "error_message": null,
      "sent_by": "uuid",
      "sender": {...},
      "event": {...},
      "sent_at": "2024-01-15T10:30:00.000Z",
      "delivered_at": "2024-01-15T10:30:05.000Z",
      "read_at": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

---

### 3. Send WhatsApp Message

**Endpoint:** `POST /api/whatsapp-messages`

**Description:** Sends a WhatsApp message to a recipient.

**Authentication:** Required

**Request Body:**
```json
{
  "recipient_phone": "string (required, valid phone number with country code)",
  "recipient_name": "string (required, max 255 chars)",
  "message_content": "string (required)",
  "message_type": "string (optional, one of: 'INVITATION', 'RAPPEL', 'NOTIFICATION')",
  "event_id": "uuid (optional)"
}
```

**Example Request:**
```json
{
  "recipient_phone": "+1234567890",
  "recipient_name": "John Doe",
  "message_content": "You are assigned to event: Wedding Reception on 2024-02-02. Please confirm your availability.",
  "message_type": "INVITATION",
  "event_id": "event-uuid"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "WhatsApp message sent successfully",
  "data": {
    "message": {
      "id": "uuid",
      "status": "ENVOYE",
      "twilio_message_sid": "SM1234567890",
      "sent_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid phone number or message content
- `500 Internal Server Error`: Failed to send message

---

### 4. Send Event Invitation

**Endpoint:** `POST /api/whatsapp-messages/event-invitation`

**Description:** Sends invitation messages to all technicians assigned to an event.

**Authentication:** Required

**Request Body:**
```json
{
  "event_id": "uuid (required)",
  "custom_message": "string (optional, additional message to include)"
}
```

**Example Request:**
```json
{
  "event_id": "event-uuid",
  "custom_message": "Please arrive 2 hours before the event for setup."
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Invitations sent to 3 technicians",
  "data": {
    "messages_sent": 3,
    "messages": [
      {
        "id": "uuid",
        "recipient_name": "John Doe",
        "status": "ENVOYE"
      }
    ]
  }
}
```

---

### 5. Send Event Reminder

**Endpoint:** `POST /api/whatsapp-messages/event-reminder`

**Description:** Sends reminder messages to technicians for upcoming events.

**Authentication:** Required

**Request Body:**
```json
{
  "event_id": "uuid (required)",
  "reminder_hours": "number (optional, hours before event, default: 24)"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Reminders sent successfully",
  "data": {
    "messages_sent": 3
  }
}
```

---

### 6. Update Message Status (Webhook)

**Endpoint:** `POST /api/whatsapp-messages/webhook`

**Description:** Webhook endpoint for Twilio to update message delivery status.

**Authentication:** Not required (uses webhook secret)

**Request Body:**
```json
{
  "MessageSid": "string",
  "MessageStatus": "string",
  "To": "string",
  "From": "string"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Status updated"
}
```

**Note:** This endpoint is called by Twilio, not directly by clients.

---

### 7. Get Messages by Event

**Endpoint:** `GET /api/events/:eventId/whatsapp-messages`

**Description:** Retrieves all WhatsApp messages related to an event.

**Authentication:** Required

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "recipient_name": "John Doe",
        "message_type": "INVITATION",
        "status": "LIVRE",
        "sent_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

## Notes

1. **Message Status Values:**
   - `ENVOYE`: Sent
   - `LIVRE`: Delivered
   - `LU`: Read
   - `ECHOUE`: Failed

2. **Message Types:**
   - `INVITATION`: Event invitation
   - `RAPPEL`: Reminder
   - `NOTIFICATION`: General notification

3. **Phone Number Format:**
   - Must include country code (e.g., +1234567890)
   - Validated before sending

4. **Twilio Integration:**
   - Requires Twilio account and credentials
   - `twilio_message_sid` stored for tracking
   - Webhook configured for delivery status updates

5. **Error Handling:**
   - Failed messages stored with error_message
   - Can be retried manually
   - Status updated via webhook

6. **Rate Limiting:**
   - Respects Twilio rate limits
   - Bulk sending may be queued
