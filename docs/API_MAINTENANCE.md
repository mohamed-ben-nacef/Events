# Maintenance Module API Documentation

## Overview
This module handles equipment maintenance records, scheduling, and tracking.

---

## Maintenance Endpoints

### 1. Get All Maintenance Records

**Endpoint:** `GET /api/maintenances`

**Description:** Retrieves all maintenance records with filtering.

**Authentication:** Required

**Query Parameters:**
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 20)
- `equipmentId` (optional, UUID): Filter by equipment
- `technicianId` (optional, UUID): Filter by technician
- `status` (optional, string): Filter by status
- `priority` (optional, string): Filter by priority

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "maintenances": [
      {
        "id": "uuid",
        "equipment_id": "uuid",
        "problem_description": "Microphone not working",
        "technician_id": "uuid",
        "priority": "HAUTE",
        "start_date": "2024-01-15",
        "expected_end_date": "2024-01-20",
        "actual_end_date": null,
        "cost": null,
        "status": "EN_COURS",
        "solution_description": null,
        "photos": [],
        "equipment": {...},
        "technician": {...},
        "created_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

### 2. Get Maintenance by ID

**Endpoint:** `GET /api/maintenances/:id`

**Description:** Retrieves detailed information about a maintenance record.

**Authentication:** Required

**Request Parameters:**
- `id` (path parameter, UUID): Maintenance ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "maintenance": {
      "id": "uuid",
      "equipment_id": "uuid",
      "problem_description": "Microphone not working",
      "technician_id": "uuid",
      "priority": "HAUTE",
      "start_date": "2024-01-15",
      "expected_end_date": "2024-01-20",
      "actual_end_date": null,
      "cost": 150.00,
      "status": "EN_COURS",
      "solution_description": null,
      "photos": ["https://example.com/damage1.jpg"],
      "equipment": {...},
      "technician": {...},
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 3. Create Maintenance Record

**Endpoint:** `POST /api/maintenances`

**Description:** Creates a new maintenance record.

**Authentication:** Required (Admin, Maintenance, or Technicien role)

**Request Body:**
```json
{
  "equipment_id": "uuid (required)",
  "problem_description": "string (required)",
  "technician_id": "uuid (required)",
  "priority": "string (optional, one of: 'BASSE', 'MOYENNE', 'HAUTE', default: 'MOYENNE')",
  "start_date": "date (required, YYYY-MM-DD)",
  "expected_end_date": "date (optional, YYYY-MM-DD)",
  "photos": "array of strings (optional, URLs)"
}
```

**Example Request:**
```json
{
  "equipment_id": "equipment-uuid",
  "problem_description": "Microphone produces static noise",
  "technician_id": "technician-uuid",
  "priority": "HAUTE",
  "start_date": "2024-01-15",
  "expected_end_date": "2024-01-20",
  "photos": ["https://example.com/damage.jpg"]
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Maintenance record created successfully",
  "data": {
    "maintenance": {
      "id": "uuid",
      "status": "EN_ATTENTE",
      ...
    }
  }
}
```

**Note:** Creating maintenance automatically updates equipment status to "EN_MAINTENANCE".

---

### 4. Update Maintenance Record

**Endpoint:** `PUT /api/maintenances/:id`

**Description:** Updates a maintenance record.

**Authentication:** Required

**Request Parameters:**
- `id` (path parameter, UUID): Maintenance ID

**Request Body:**
```json
{
  "problem_description": "string (optional)",
  "technician_id": "uuid (optional)",
  "priority": "string (optional)",
  "expected_end_date": "date (optional)",
  "actual_end_date": "date (optional)",
  "cost": "number (optional, decimal)",
  "status": "string (optional)",
  "solution_description": "string (optional)",
  "photos": "array of strings (optional)"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Maintenance record updated successfully",
  "data": {
    "maintenance": {...}
  }
}
```

---

### 5. Complete Maintenance

**Endpoint:** `POST /api/maintenances/:id/complete`

**Description:** Marks maintenance as completed and updates equipment status.

**Authentication:** Required

**Request Body:**
```json
{
  "actual_end_date": "date (optional, defaults to today)",
  "cost": "number (optional, decimal)",
  "solution_description": "string (required)",
  "photos": "array of strings (optional, repair photos)"
}
```

**Example Request:**
```json
{
  "actual_end_date": "2024-01-18",
  "cost": 150.00,
  "solution_description": "Replaced damaged cable, tested and working",
  "photos": ["https://example.com/repair1.jpg"]
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Maintenance completed successfully",
  "data": {
    "maintenance": {
      "status": "TERMINE",
      "actual_end_date": "2024-01-18",
      ...
    },
    "equipment": {
      "status": "DISPONIBLE"
    }
  }
}
```

**Note:** Completing maintenance automatically updates equipment status back to "DISPONIBLE".

---

### 6. Delete Maintenance Record

**Endpoint:** `DELETE /api/maintenances/:id`

**Description:** Deletes a maintenance record.

**Authentication:** Required (Admin only)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Maintenance record deleted successfully"
}
```

---

## Notes

1. **Status Values:**
   - `EN_ATTENTE`: Waiting/Pending
   - `EN_COURS`: In Progress
   - `TERMINE`: Completed

2. **Priority Values:**
   - `BASSE`: Low
   - `MOYENNE`: Medium (default)
   - `HAUTE`: High

3. **Automatic Status Updates:**
   - Creating maintenance → Equipment status: "EN_MAINTENANCE"
   - Completing maintenance → Equipment status: "DISPONIBLE"

4. **Photos:**
   - Can include damage photos when creating
   - Can include repair photos when completing
