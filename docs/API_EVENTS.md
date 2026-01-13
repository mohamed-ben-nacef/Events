# Events Module API Documentation

## Overview
This module handles event management, equipment reservations, and technician assignments.

---

## Events Endpoints

### 1. Get All Events

**Endpoint:** `GET /api/events`

**Description:** Retrieves all events with filtering and pagination.

**Authentication:** Required

**Query Parameters:**
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 20)
- `status` (optional, string): Filter by status
- `category` (optional, string): Filter by category
- `dateFrom` (optional, date): Filter events from date
- `dateTo` (optional, date): Filter events to date

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "event_name": "Wedding Reception",
        "client_name": "John & Jane Doe",
        "contact_person": "John Doe",
        "phone": "+1234567890",
        "email": "john@example.com",
        "address": "123 Main St, City",
        "installation_date": "2024-02-01",
        "event_date": "2024-02-02",
        "dismantling_date": "2024-02-03",
        "category": "MIXTE",
        "status": "PLANIFIE",
        "budget": 5000.00,
        "participant_count": 200,
        "event_type": "Wedding",
        "created_by": "uuid",
        "creator": {
          "id": "uuid",
          "full_name": "Admin User"
        },
        "equipment_reservations": [...],
        "technician_assignments": [...],
        "created_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

### 2. Get Event by ID

**Endpoint:** `GET /api/events/:id`

**Description:** Retrieves detailed information about a specific event.

**Authentication:** Required

**Request Parameters:**
- `id` (path parameter, UUID): Event ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "uuid",
      "event_name": "Wedding Reception",
      "client_name": "John & Jane Doe",
      "contact_person": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com",
      "address": "123 Main St, City",
      "installation_date": "2024-02-01",
      "event_date": "2024-02-02",
      "dismantling_date": "2024-02-03",
      "category": "MIXTE",
      "status": "PLANIFIE",
      "notes": "Special requirements...",
      "budget": 5000.00,
      "participant_count": 200,
      "event_type": "Wedding",
      "created_by": "uuid",
      "creator": {...},
      "equipment_reservations": [
        {
          "id": "uuid",
          "equipment_id": "uuid",
          "quantity_reserved": 5,
          "quantity_returned": 0,
          "status": "RESERVE",
          "equipment": {...}
        }
      ],
      "technician_assignments": [...],
      "transports": [...],
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 3. Create Event

**Endpoint:** `POST /api/events`

**Description:** Creates a new event.

**Authentication:** Required

**Request Body:**
```json
{
  "event_name": "string (required, max 255 chars)",
  "client_name": "string (required, max 255 chars)",
  "contact_person": "string (required, max 255 chars)",
  "phone": "string (required, max 20 chars)",
  "email": "string (optional, valid email)",
  "address": "string (required)",
  "installation_date": "date (required, YYYY-MM-DD)",
  "event_date": "date (required, YYYY-MM-DD)",
  "dismantling_date": "date (required, YYYY-MM-DD)",
  "category": "string (required, one of: 'SON', 'VIDEO', 'LUMIERE', 'MIXTE')",
  "status": "string (optional, default: 'PLANIFIE')",
  "notes": "string (optional)",
  "budget": "number (optional, decimal)",
  "participant_count": "number (optional, integer)",
  "event_type": "string (optional, max 100 chars)"
}
```

**Example Request:**
```json
{
  "event_name": "Wedding Reception",
  "client_name": "John & Jane Doe",
  "contact_person": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "address": "123 Main St, City, Country",
  "installation_date": "2024-02-01",
  "event_date": "2024-02-02",
  "dismantling_date": "2024-02-03",
  "category": "MIXTE",
  "budget": 5000.00,
  "participant_count": 200,
  "event_type": "Wedding"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "event": {
      "id": "uuid",
      "event_name": "Wedding Reception",
      "status": "PLANIFIE",
      ...
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors (e.g., dates invalid)

---

### 4. Update Event

**Endpoint:** `PUT /api/events/:id`

**Description:** Updates an existing event.

**Authentication:** Required

**Request Parameters:**
- `id` (path parameter, UUID): Event ID

**Request Body:** (All fields optional, same as create)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": {
    "event": {...}
  }
}
```

---

### 5. Delete Event

**Endpoint:** `DELETE /api/events/:id`

**Description:** Deletes an event (cascades to reservations and assignments).

**Authentication:** Required (Admin only)

**Request Parameters:**
- `id` (path parameter, UUID): Event ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

## Event Equipment Endpoints

### 6. Reserve Equipment for Event

**Endpoint:** `POST /api/events/:eventId/equipment`

**Description:** Reserves equipment for an event.

**Authentication:** Required

**Request Parameters:**
- `eventId` (path parameter, UUID): Event ID

**Request Body:**
```json
{
  "equipment_id": "uuid (required)",
  "quantity_reserved": "number (required, must be <= available quantity)",
  "notes": "string (optional)"
}
```

**Example Request:**
```json
{
  "equipment_id": "equipment-uuid",
  "quantity_reserved": 5,
  "notes": "Need wireless microphones"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Equipment reserved successfully",
  "data": {
    "reservation": {
      "id": "uuid",
      "event_id": "uuid",
      "equipment_id": "uuid",
      "quantity_reserved": 5,
      "quantity_returned": 0,
      "status": "RESERVE",
      "equipment": {...}
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Insufficient available quantity
- `404 Not Found`: Event or equipment not found

---

### 7. Update Equipment Reservation

**Endpoint:** `PUT /api/events/:eventId/equipment/:reservationId`

**Description:** Updates equipment reservation (e.g., change quantity, mark as delivered).

**Authentication:** Required

**Request Body:**
```json
{
  "quantity_reserved": "number (optional)",
  "quantity_returned": "number (optional)",
  "status": "string (optional, one of: 'RESERVE', 'LIVRE', 'RETOURNE')",
  "notes": "string (optional)"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Reservation updated successfully",
  "data": {
    "reservation": {...}
  }
}
```

---

### 8. Return Equipment

**Endpoint:** `POST /api/events/:eventId/equipment/:reservationId/return`

**Description:** Marks equipment as returned and updates quantities.

**Authentication:** Required

**Request Body:**
```json
{
  "quantity_returned": "number (required, must be <= reserved quantity)",
  "notes": "string (optional)"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Equipment returned successfully",
  "data": {
    "reservation": {
      "status": "RETOURNE",
      "quantity_returned": 5
    }
  }
}
```

---

## Event Technicians Endpoints

### 9. Assign Technician to Event

**Endpoint:** `POST /api/events/:eventId/technicians`

**Description:** Assigns a technician to an event.

**Authentication:** Required

**Request Parameters:**
- `eventId` (path parameter, UUID): Event ID

**Request Body:**
```json
{
  "technician_id": "uuid (required)",
  "role": "string (optional, e.g., 'Chef équipe', 'Technicien son')"
}
```

**Example Request:**
```json
{
  "technician_id": "technician-uuid",
  "role": "Chef équipe"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Technician assigned successfully",
  "data": {
    "assignment": {
      "id": "uuid",
      "event_id": "uuid",
      "technician_id": "uuid",
      "role": "Chef équipe",
      "is_prepared": false,
      "technician": {
        "id": "uuid",
        "full_name": "John Doe",
        "email": "john@example.com"
      }
    }
  }
}
```

**Error Responses:**
- `409 Conflict`: Technician already assigned to this event

---

### 10. Mark Technician as Prepared

**Endpoint:** `PUT /api/events/:eventId/technicians/:assignmentId/prepare`

**Description:** Marks technician as prepared for the event.

**Authentication:** Required

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Technician marked as prepared",
  "data": {
    "assignment": {
      "is_prepared": true,
      "prepared_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 11. Remove Technician from Event

**Endpoint:** `DELETE /api/events/:eventId/technicians/:assignmentId`

**Description:** Removes a technician assignment from an event.

**Authentication:** Required

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Technician removed from event"
}
```

---

## Notes

1. **Event Status Values:**
   - `PLANIFIE`: Planned/Scheduled
   - `EN_COURS`: In Progress
   - `TERMINE`: Completed
   - `ANNULE`: Cancelled

2. **Reservation Status:**
   - `RESERVE`: Reserved
   - `LIVRE`: Delivered
   - `RETOURNE`: Returned

3. **Date Validation:**
   - `installation_date` <= `event_date` <= `dismantling_date`

4. **Equipment Availability:**
   - System checks available quantity before reservation
   - Automatically updates equipment status
