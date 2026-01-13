# Equipment Module API Documentation

## Overview
This module handles equipment inventory, stock management, and equipment status tracking.

---

## Equipment Endpoints

### 1. Get All Equipment

**Endpoint:** `GET /api/equipment`

**Description:** Retrieves all equipment with filtering and pagination.

**Authentication:** Required

**Query Parameters:**
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 20)
- `categoryId` (optional, UUID): Filter by category
- `subcategoryId` (optional, UUID): Filter by subcategory
- `search` (optional, string): Search by name or reference
- `status` (optional, string): Filter by availability status

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "equipment": [
      {
        "id": "uuid",
        "name": "Wireless Microphone",
        "reference": "EQ-SON-001",
        "category_id": "uuid",
        "subcategory_id": "uuid",
        "brand": "Shure",
        "model": "SM58",
        "description": "Professional wireless microphone",
        "quantity_total": 10,
        "quantity_available": 7,
        "daily_rental_price": 25.50,
        "category": {...},
        "subcategory": {...},
        "created_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

### 2. Get Equipment by ID

**Endpoint:** `GET /api/equipment/:id`

**Description:** Retrieves detailed information about a specific equipment item.

**Authentication:** Required

**Request Parameters:**
- `id` (path parameter, UUID): Equipment ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "equipment": {
      "id": "uuid",
      "name": "Wireless Microphone",
      "reference": "EQ-SON-001",
      "category_id": "uuid",
      "subcategory_id": "uuid",
      "brand": "Shure",
      "model": "SM58",
      "description": "Professional wireless microphone",
      "technical_specs": "Frequency: 470-698 MHz",
      "quantity_total": 10,
      "quantity_available": 7,
      "purchase_price": 500.00,
      "daily_rental_price": 25.50,
      "purchase_date": "2024-01-01",
      "warranty_end_date": "2025-01-01",
      "supplier": "Audio Supplier Inc.",
      "weight_kg": 0.5,
      "qr_code_url": "https://example.com/qr/eq-son-001",
      "photos": ["https://example.com/photo1.jpg"],
      "manual_url": "https://example.com/manual.pdf",
      "category": {...},
      "subcategory": {...},
      "status_history": [...],
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 3. Create Equipment

**Endpoint:** `POST /api/equipment`

**Description:** Creates a new equipment item. Reference is auto-generated.

**Authentication:** Required (Admin or Maintenance role)

**Request Body:**
```json
{
  "name": "string (required, max 255 chars)",
  "category_id": "uuid (required)",
  "subcategory_id": "uuid (optional)",
  "brand": "string (optional, max 100 chars)",
  "model": "string (optional, max 100 chars)",
  "description": "string (optional)",
  "technical_specs": "string (optional)",
  "quantity_total": "number (required, default: 0)",
  "purchase_price": "number (optional, decimal)",
  "daily_rental_price": "number (optional, decimal)",
  "purchase_date": "date (optional, YYYY-MM-DD)",
  "warranty_end_date": "date (optional, YYYY-MM-DD)",
  "supplier": "string (optional, max 255 chars)",
  "weight_kg": "number (optional, decimal)",
  "photos": "array of strings (optional, URLs)",
  "manual_url": "string (optional, URL)"
}
```

**Example Request:**
```json
{
  "name": "Wireless Microphone",
  "category_id": "category-uuid",
  "subcategory_id": "subcategory-uuid",
  "brand": "Shure",
  "model": "SM58",
  "description": "Professional wireless microphone",
  "quantity_total": 10,
  "daily_rental_price": 25.50,
  "purchase_price": 500.00
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Equipment created successfully",
  "data": {
    "equipment": {
      "id": "uuid",
      "reference": "EQ-SON-001",
      "name": "Wireless Microphone",
      "quantity_available": 10,
      ...
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `404 Not Found`: Category or subcategory not found

---

### 4. Update Equipment

**Endpoint:** `PUT /api/equipment/:id`

**Description:** Updates an existing equipment item.

**Authentication:** Required (Admin or Maintenance role)

**Request Parameters:**
- `id` (path parameter, UUID): Equipment ID

**Request Body:** (All fields optional, same as create)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Equipment updated successfully",
  "data": {
    "equipment": {...}
  }
}
```

---

### 5. Delete Equipment

**Endpoint:** `DELETE /api/equipment/:id`

**Description:** Deletes an equipment item.

**Authentication:** Required (Admin only)

**Request Parameters:**
- `id` (path parameter, UUID): Equipment ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Equipment deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Equipment is currently in use

---

## Equipment Status Endpoints

### 6. Get Equipment Status History

**Endpoint:** `GET /api/equipment/:id/status`

**Description:** Retrieves status history for an equipment item.

**Authentication:** Required

**Request Parameters:**
- `id` (path parameter, UUID): Equipment ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status_history": [
      {
        "id": "uuid",
        "equipment_id": "uuid",
        "status": "EN_LOCATION",
        "quantity": 3,
        "related_event_id": "uuid",
        "notes": "Rented for event",
        "changed_by": "uuid",
        "changer": {
          "id": "uuid",
          "full_name": "John Doe"
        },
        "changed_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

### 7. Update Equipment Status

**Endpoint:** `POST /api/equipment/:id/status`

**Description:** Updates equipment status (creates status history entry).

**Authentication:** Required

**Request Parameters:**
- `id` (path parameter, UUID): Equipment ID

**Request Body:**
```json
{
  "status": "string (required, one of: 'DISPONIBLE', 'EN_LOCATION', 'EN_MAINTENANCE', 'MANQUANT')",
  "quantity": "number (required, must be <= available quantity)",
  "related_event_id": "uuid (optional)",
  "related_maintenance_id": "uuid (optional)",
  "notes": "string (optional)"
}
```

**Example Request:**
```json
{
  "status": "EN_LOCATION",
  "quantity": 3,
  "related_event_id": "event-uuid",
  "notes": "Rented for wedding event"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Equipment status updated successfully",
  "data": {
    "status": {
      "id": "uuid",
      "equipment_id": "uuid",
      "status": "EN_LOCATION",
      "quantity": 3,
      "changed_at": "2024-01-15T10:30:00.000Z"
    },
    "equipment": {
      "quantity_available": 4
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid quantity or status
- `404 Not Found`: Equipment not found

---

## Notes

1. **Reference Generation:**
   - Auto-generated as: `EQ-{CATEGORY_CODE}-{SEQUENCE}`
   - Format: EQ-SON-001, EQ-VIDEO-001, etc.

2. **Quantity Management:**
   - `quantity_available` is automatically calculated
   - Updated when status changes

3. **Status Values:**
   - `DISPONIBLE`: Available for rent
   - `EN_LOCATION`: Currently rented
   - `EN_MAINTENANCE`: Under maintenance
   - `MANQUANT`: Missing/lost

4. **Permissions:**
   - View: All authenticated users
   - Create/Update: Admin, Maintenance
   - Delete: Admin only
