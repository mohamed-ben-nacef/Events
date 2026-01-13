# Vehicles & Transport Module API Documentation

## Overview
This module handles vehicle management and transport planning for events.

---

## Vehicles Endpoints

### 1. Get All Vehicles

**Endpoint:** `GET /api/vehicles`

**Description:** Retrieves all vehicles with filtering.

**Authentication:** Required

**Query Parameters:**
- `status` (optional, string): Filter by status
- `type` (optional, string): Filter by vehicle type

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "vehicles": [
      {
        "id": "uuid",
        "registration_number": "ABC-123",
        "type": "CAMION",
        "brand": "Mercedes",
        "model": "Sprinter",
        "load_capacity_kg": 3500.00,
        "cargo_dimensions": "3.5m x 2.0m x 2.0m",
        "photo_url": "https://example.com/vehicle.jpg",
        "insurance_expiry": "2024-12-31",
        "technical_inspection_expiry": "2024-06-30",
        "fuel_type": "Diesel",
        "current_mileage": 50000,
        "status": "DISPONIBLE",
        "created_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

### 2. Get Vehicle by ID

**Endpoint:** `GET /api/vehicles/:id`

**Description:** Retrieves detailed information about a vehicle.

**Authentication:** Required

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "vehicle": {
      "id": "uuid",
      "registration_number": "ABC-123",
      "type": "CAMION",
      "brand": "Mercedes",
      "model": "Sprinter",
      "load_capacity_kg": 3500.00,
      "cargo_dimensions": "3.5m x 2.0m x 2.0m",
      "photo_url": "https://example.com/vehicle.jpg",
      "insurance_expiry": "2024-12-31",
      "technical_inspection_expiry": "2024-06-30",
      "fuel_type": "Diesel",
      "current_mileage": 50000,
      "status": "DISPONIBLE",
      "transports": [...],
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 3. Create Vehicle

**Endpoint:** `POST /api/vehicles`

**Description:** Creates a new vehicle record.

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "registration_number": "string (required, unique, max 50 chars)",
  "type": "string (required, one of: 'CAMION', 'UTILITAIRE', 'VOITURE')",
  "brand": "string (required, max 100 chars)",
  "model": "string (required, max 100 chars)",
  "load_capacity_kg": "number (required, decimal)",
  "cargo_dimensions": "string (optional, e.g., 'L x W x H')",
  "photo_url": "string (optional, URL)",
  "insurance_expiry": "date (optional, YYYY-MM-DD)",
  "technical_inspection_expiry": "date (optional, YYYY-MM-DD)",
  "fuel_type": "string (optional, max 50 chars)",
  "current_mileage": "number (optional, integer, default: 0)"
}
```

**Example Request:**
```json
{
  "registration_number": "ABC-123",
  "type": "CAMION",
  "brand": "Mercedes",
  "model": "Sprinter",
  "load_capacity_kg": 3500.00,
  "cargo_dimensions": "3.5m x 2.0m x 2.0m",
  "insurance_expiry": "2024-12-31",
  "technical_inspection_expiry": "2024-06-30",
  "fuel_type": "Diesel"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Vehicle created successfully",
  "data": {
    "vehicle": {...}
  }
}
```

---

### 4. Update Vehicle

**Endpoint:** `PUT /api/vehicles/:id`

**Description:** Updates vehicle information.

**Authentication:** Required (Admin only)

**Request Body:** (All fields optional, same as create)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Vehicle updated successfully",
  "data": {
    "vehicle": {...}
  }
}
```

---

### 5. Delete Vehicle

**Endpoint:** `DELETE /api/vehicles/:id`

**Description:** Deletes a vehicle.

**Authentication:** Required (Admin only)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Vehicle deleted successfully"
}
```

---

## Transport Endpoints

### 6. Get All Transports

**Endpoint:** `GET /api/transports`

**Description:** Retrieves all transport records.

**Authentication:** Required

**Query Parameters:**
- `eventId` (optional, UUID): Filter by event
- `vehicleId` (optional, UUID): Filter by vehicle
- `driverId` (optional, UUID): Filter by driver
- `status` (optional, string): Filter by status

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transports": [
      {
        "id": "uuid",
        "event_id": "uuid",
        "vehicle_id": "uuid",
        "driver_id": "uuid",
        "departure_address": "Warehouse, 123 Main St",
        "arrival_address": "Event Venue, 456 Oak Ave",
        "departure_date": "2024-02-01T08:00:00.000Z",
        "return_date": null,
        "departure_mileage": 50000,
        "arrival_mileage": null,
        "fuel_cost": null,
        "total_weight_kg": null,
        "status": "PLANIFIE",
        "incidents": null,
        "notes": null,
        "event": {...},
        "vehicle": {...},
        "driver": {...},
        "created_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

### 7. Get Transport by ID

**Endpoint:** `GET /api/transports/:id`

**Description:** Retrieves detailed transport information.

**Authentication:** Required

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transport": {
      "id": "uuid",
      "event_id": "uuid",
      "vehicle_id": "uuid",
      "driver_id": "uuid",
      "departure_address": "Warehouse, 123 Main St",
      "arrival_address": "Event Venue, 456 Oak Ave",
      "departure_date": "2024-02-01T08:00:00.000Z",
      "return_date": "2024-02-03T18:00:00.000Z",
      "departure_mileage": 50000,
      "arrival_mileage": 50150,
      "fuel_cost": 75.50,
      "total_weight_kg": 2500.00,
      "status": "TERMINE",
      "incidents": null,
      "notes": "All equipment delivered safely",
      "event": {...},
      "vehicle": {...},
      "driver": {...}
    }
  }
}
```

---

### 8. Create Transport

**Endpoint:** `POST /api/transports`

**Description:** Creates a new transport record.

**Authentication:** Required

**Request Body:**
```json
{
  "event_id": "uuid (required)",
  "vehicle_id": "uuid (required)",
  "driver_id": "uuid (required)",
  "departure_address": "string (required)",
  "arrival_address": "string (required)",
  "departure_date": "datetime (required, ISO 8601)",
  "return_date": "datetime (optional, ISO 8601)",
  "departure_mileage": "number (optional, integer)",
  "total_weight_kg": "number (optional, decimal)"
}
```

**Example Request:**
```json
{
  "event_id": "event-uuid",
  "vehicle_id": "vehicle-uuid",
  "driver_id": "driver-uuid",
  "departure_address": "Warehouse, 123 Main St",
  "arrival_address": "Event Venue, 456 Oak Ave",
  "departure_date": "2024-02-01T08:00:00.000Z",
  "departure_mileage": 50000,
  "total_weight_kg": 2500.00
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Transport created successfully",
  "data": {
    "transport": {
      "id": "uuid",
      "status": "PLANIFIE",
      ...
    }
  }
}
```

**Note:** Creating transport automatically updates vehicle status to "EN_SERVICE".

---

### 9. Update Transport Status

**Endpoint:** `PUT /api/transports/:id/status`

**Description:** Updates transport status (e.g., EN_ROUTE, LIVRE, RETOUR, TERMINE).

**Authentication:** Required

**Request Body:**
```json
{
  "status": "string (required, one of: 'PLANIFIE', 'EN_ROUTE', 'LIVRE', 'RETOUR', 'TERMINE')",
  "arrival_mileage": "number (optional, integer)",
  "return_date": "datetime (optional)",
  "fuel_cost": "number (optional, decimal)",
  "incidents": "string (optional)",
  "notes": "string (optional)"
}
```

**Example Request:**
```json
{
  "status": "LIVRE",
  "arrival_mileage": 50150,
  "notes": "Equipment delivered successfully"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Transport status updated successfully",
  "data": {
    "transport": {
      "status": "LIVRE",
      "arrival_mileage": 50150,
      ...
    }
  }
}
```

---

### 10. Complete Transport

**Endpoint:** `POST /api/transports/:id/complete`

**Description:** Marks transport as completed and updates vehicle status.

**Authentication:** Required

**Request Body:**
```json
{
  "return_date": "datetime (optional, defaults to now)",
  "arrival_mileage": "number (optional, integer)",
  "fuel_cost": "number (optional, decimal)",
  "incidents": "string (optional)",
  "notes": "string (optional)"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Transport completed successfully",
  "data": {
    "transport": {
      "status": "TERMINE",
      ...
    },
    "vehicle": {
      "status": "DISPONIBLE",
      "current_mileage": 50150
    }
  }
}
```

**Note:** Completing transport automatically:
- Updates vehicle status to "DISPONIBLE"
- Updates vehicle current_mileage

---

## Notes

1. **Vehicle Status Values:**
   - `DISPONIBLE`: Available
   - `EN_SERVICE`: In Service
   - `EN_MAINTENANCE`: Under Maintenance

2. **Transport Status Values:**
   - `PLANIFIE`: Planned
   - `EN_ROUTE`: En Route
   - `LIVRE`: Delivered
   - `RETOUR`: Return Trip
   - `TERMINE`: Completed

3. **Automatic Updates:**
   - Creating transport → Vehicle status: "EN_SERVICE"
   - Completing transport → Vehicle status: "DISPONIBLE", mileage updated

4. **Weight Validation:**
   - System should validate total_weight_kg <= vehicle load_capacity_kg
