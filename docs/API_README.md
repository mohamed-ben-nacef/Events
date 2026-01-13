# API Documentation Index

This directory contains comprehensive API documentation for all modules in the Audiovisual Event Manager backend.

## Available Documentation

### ✅ Completed Modules

1. **[Authentication Module](./API_AUTH.md)**
   - User registration and login
   - Password management (reset, change)
   - Email verification
   - JWT token management
   - Profile management

### 📋 Module Templates (To be implemented)

2. **[Categories & Subcategories Module](./API_CATEGORIES.md)**
   - Equipment categories (SON, VIDEO, LUMIERE)
   - Subcategory management
   - CRUD operations

3. **[Equipment Module](./API_EQUIPMENT.md)**
   - Equipment inventory management
   - Stock tracking
   - Equipment status management
   - QR code integration

4. **[Events Module](./API_EVENTS.md)**
   - Event creation and management
   - Equipment reservations
   - Technician assignments
   - Event status tracking

5. **Maintenance Module** (Template to be created)
   - Maintenance records
   - Equipment maintenance tracking
   - Maintenance scheduling

6. **Vehicles & Transport Module** (Template to be created)
   - Vehicle management
   - Transport planning
   - Driver assignments

7. **WhatsApp Messages Module** (Template to be created)
   - Message sending
   - Message tracking
   - Notification management

8. **Activity Logs Module** (Template to be created)
   - Audit trail
   - Activity tracking
   - User actions logging

## Documentation Structure

Each API documentation file includes:

- **Endpoint Information:**
  - HTTP Method
  - URL Path
  - Description
  - Authentication requirements

- **Request Details:**
  - Request body parameters
  - Query parameters
  - Path parameters
  - Required vs optional fields
  - Data types and validation rules

- **Response Examples:**
  - Success responses (200, 201)
  - Error responses (400, 401, 403, 404, 409, 500)
  - Response data structure

- **Additional Information:**
  - Rate limits
  - Permissions/roles
  - Business logic notes
  - Common use cases

## Quick Reference

### Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Authentication
Most endpoints require authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Common Response Format
```json
{
  "success": true|false,
  "message": "string",
  "data": {
    // Response data
  }
}
```

### Common Error Format
```json
{
  "success": false,
  "message": "Error description"
}
```

## Testing

Use the provided test files:
- `test-email.http` - REST Client format
- `test-email-simple.html` - Web-based tester
- Postman collection (import `test-email.http`)

## Support

For questions or issues:
1. Check the specific module documentation
2. Review error messages in responses
3. Check server logs for detailed error information

---

**Last Updated:** 2024-01-15
