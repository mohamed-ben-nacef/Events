# Activity Logs Module API Documentation

## Overview
This module provides audit trail and activity logging for all system actions.

---

## Activity Logs Endpoints

### 1. Get All Activity Logs

**Endpoint:** `GET /api/activity-logs`

**Description:** Retrieves all activity logs with filtering and pagination.

**Authentication:** Required (Admin only)

**Query Parameters:**
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 50)
- `userId` (optional, UUID): Filter by user
- `action` (optional, string): Filter by action type
- `entityType` (optional, string): Filter by entity type
- `entityId` (optional, UUID): Filter by specific entity
- `dateFrom` (optional, date): Filter from date
- `dateTo` (optional, date): Filter to date

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "action": "CREATE",
        "entity_type": "EVENT",
        "entity_id": "uuid",
        "description": "Created event: Wedding Reception",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "user": {
          "id": "uuid",
          "full_name": "John Doe",
          "email": "john@example.com"
        },
        "created_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1000,
      "totalPages": 20
    }
  }
}
```

---

### 2. Get Activity Log by ID

**Endpoint:** `GET /api/activity-logs/:id`

**Description:** Retrieves detailed information about a specific activity log.

**Authentication:** Required (Admin only)

**Request Parameters:**
- `id` (path parameter, UUID): Log ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "log": {
      "id": "uuid",
      "user_id": "uuid",
      "action": "UPDATE",
      "entity_type": "EQUIPMENT",
      "entity_id": "uuid",
      "description": "Updated equipment: Wireless Microphone - Changed quantity from 10 to 12",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "user": {...},
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 3. Get User Activity Logs

**Endpoint:** `GET /api/users/:userId/activity-logs`

**Description:** Retrieves all activity logs for a specific user.

**Authentication:** Required (Admin or own user)

**Request Parameters:**
- `userId` (path parameter, UUID): User ID

**Query Parameters:**
- `page`, `limit`, `action`, `entityType` (same as Get All Logs)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "logs": [...],
    "pagination": {...}
  }
}
```

---

### 4. Get Entity Activity Logs

**Endpoint:** `GET /api/activity-logs/entity/:entityType/:entityId`

**Description:** Retrieves all activity logs for a specific entity.

**Authentication:** Required

**Request Parameters:**
- `entityType` (path parameter, string): Entity type (e.g., EVENT, EQUIPMENT)
- `entityId` (path parameter, UUID): Entity ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "action": "CREATE",
        "description": "Created event: Wedding Reception",
        "user": {...},
        "created_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "uuid",
        "action": "UPDATE",
        "description": "Updated event status to EN_COURS",
        "user": {...},
        "created_at": "2024-01-15T11:00:00.000Z"
      }
    ]
  }
}
```

---

### 5. Export Activity Logs

**Endpoint:** `GET /api/activity-logs/export`

**Description:** Exports activity logs to CSV format.

**Authentication:** Required (Admin only)

**Query Parameters:**
- Same filtering options as Get All Logs
- `format` (optional, string): Export format (default: 'csv')

**Success Response (200 OK):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="activity-logs-2024-01-15.csv"

id,user_id,action,entity_type,entity_id,description,ip_address,created_at
uuid1,uuid,CREATE,EVENT,uuid,...
```

---

## Activity Log Structure

### Action Types
- `CREATE`: Entity created
- `UPDATE`: Entity updated
- `DELETE`: Entity deleted
- `LOGIN`: User login
- `LOGOUT`: User logout
- `PASSWORD_RESET`: Password reset requested
- `PASSWORD_CHANGED`: Password changed
- `EMAIL_VERIFIED`: Email verified
- `STATUS_CHANGED`: Status changed

### Entity Types
- `USER`: User entity
- `EVENT`: Event entity
- `EQUIPMENT`: Equipment entity
- `MAINTENANCE`: Maintenance entity
- `VEHICLE`: Vehicle entity
- `TRANSPORT`: Transport entity
- `CATEGORY`: Category entity
- `SUBCATEGORY`: Subcategory entity

### Description Format
Descriptions are human-readable and include:
- Action performed
- Entity name/identifier
- Key changes (for updates)
- Additional context

**Examples:**
- "Created event: Wedding Reception"
- "Updated equipment: Wireless Microphone - Changed quantity from 10 to 12"
- "Assigned technician John Doe to event: Wedding Reception"
- "Changed password for user: john@example.com"

---

## Notes

1. **Automatic Logging:**
   - All create, update, delete operations are automatically logged
   - User authentication actions are logged
   - IP address and user agent captured

2. **Privacy:**
   - Sensitive data (passwords) are never logged
   - Only metadata and descriptions are stored

3. **Retention:**
   - Logs are kept indefinitely (or per retention policy)
   - Can be archived or deleted based on policy

4. **Performance:**
   - Logging is asynchronous to avoid performance impact
   - Large exports may be queued

5. **Access Control:**
   - Only admins can view all logs
   - Users can view their own activity logs
   - Entity logs visible to users with access to that entity
