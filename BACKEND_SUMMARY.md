# Audiovisual Event Manager - Backend Summary

## 🎯 Overview

A comprehensive, production-ready backend system for managing audiovisual equipment rental, events, maintenance, transportation, and team coordination. Built with Node.js, TypeScript, Express, PostgreSQL, and Sequelize ORM.

---

## 📊 System Architecture

### Technology Stack
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js 5.x
- **Database:** PostgreSQL with Sequelize ORM
- **Authentication:** JWT (Access + Refresh Tokens)
- **Security:** Helmet, CORS, Rate Limiting, bcrypt
- **Email:** Nodemailer (SMTP)
- **Validation:** express-validator
- **Logging:** Morgan

---

## 🗄️ Database Schema (13 Tables)

### Core Tables

1. **users** - User authentication and management
2. **categories** - Equipment categories (SON, VIDEO, LUMIERE)
3. **subcategories** - Equipment subcategories
4. **equipment** - Equipment inventory/stock
5. **equipment_status** - Equipment status history tracking
6. **events** - Event/location management
7. **event_equipment** - Equipment reservations for events
8. **event_technicians** - Technician assignments to events
9. **maintenances** - Equipment maintenance records
10. **vehicles** - Transport vehicle fleet
11. **transports** - Transport planning and tracking
12. **whatsapp_messages** - WhatsApp communication history
13. **activity_logs** - System audit trail

---

## 🔐 Module 1: Authentication & Users

### Features
- ✅ User registration with email verification
- ✅ Secure login with JWT tokens (access + refresh)
- ✅ Password reset via email
- ✅ Password change (authenticated users)
- ✅ Email verification system
- ✅ Profile management
- ✅ Role-based access control (ADMIN, MAINTENANCE, TECHNICIEN)
- ✅ Account activation/deactivation
- ✅ IP tracking and last login tracking
- ✅ Rate limiting on sensitive endpoints

### Endpoints: 11
- Registration, Login, Token Refresh, Logout
- Profile Management, Password Management
- Email Verification

### Security Features
- Password hashing (bcrypt, 12 rounds)
- JWT token management
- Rate limiting (login: 5/15min, registration: 3/hour)
- Email notifications for all actions

---

## 📁 Module 2: Categories & Subcategories

### Features
- ✅ Category management (SON, VIDEO, LUMIERE)
- ✅ Subcategory management
- ✅ Flexible structure (categories can exist alone or with subcategories)
- ✅ Unique name validation per category
- ✅ Cascade delete protection

### Endpoints: 10
- Category CRUD (5 endpoints)
- Subcategory CRUD (5 endpoints)

### Business Logic
- Categories can exist without subcategories
- Subcategory names unique per category
- Prevents deletion if equipment is associated

---

## 📦 Module 3: Equipment (Stock Management)

### Features
- ✅ Complete equipment inventory management
- ✅ Auto-generated unique references (EQ-SON-001, EQ-VIDEO-001, etc.)
- ✅ Quantity tracking (total vs available)
- ✅ Equipment status history
- ✅ Search and filtering capabilities
- ✅ Equipment details (brand, model, specs, photos, manuals)
- ✅ QR code support
- ✅ Price management (purchase & rental)

### Endpoints: 7
- Equipment CRUD (5 endpoints)
- Status Management (2 endpoints)

### Key Features
- **Reference Generation:** Automatic sequential numbering per category
- **Quantity Management:** Auto-calculated available quantity
- **Status Tracking:** Full history with user tracking
- **Search:** By name, reference, category, subcategory

---

## 🎪 Module 4: Events (Location Management)

### Features
- ✅ Complete event lifecycle management
- ✅ Equipment reservation with availability checks
- ✅ Technician assignment and preparation tracking
- ✅ Date validation (installation ≤ event ≤ dismantling)
- ✅ Equipment maintenance check before reservation
- ✅ Quantity validation before reservation
- ✅ Automatic equipment status updates
- ✅ Equipment return tracking

### Endpoints: 11
- Event CRUD (5 endpoints)
- Equipment Reservations (3 endpoints)
- Technician Assignments (3 endpoints)

### Critical Validations
- ✅ **Equipment Availability Check:** Validates quantity available
- ✅ **Maintenance Check:** Prevents reserving equipment in maintenance
- ✅ **Quantity Validation:** Ensures sufficient stock
- ✅ **Auto Status Updates:** Equipment status updated automatically

### Business Logic
- Equipment reservations automatically reduce available quantity
- Equipment returns automatically increase available quantity
- Status tracking for each reservation (RESERVE → LIVRE → RETOURNE)
- Technician preparation status tracking

---

## 🔧 Module 5: Maintenance

### Features
- ✅ Maintenance record management
- ✅ Priority levels (BASSE, MOYENNE, HAUTE)
- ✅ Status tracking (EN_ATTENTE → EN_COURS → TERMINE)
- ✅ Automatic equipment status update to EN_MAINTENANCE
- ✅ Automatic equipment status restoration on completion
- ✅ Cost tracking
- ✅ Photo documentation (damage & repair)
- ✅ Solution documentation

### Endpoints: 6
- Maintenance CRUD (5 endpoints)
- Complete Maintenance (1 endpoint)

### Automatic Actions
- Creating maintenance → Equipment status: EN_MAINTENANCE
- Completing maintenance → Equipment status: DISPONIBLE
- Equipment quantity_available set to 0 during maintenance
- Equipment quantity_available restored on completion

---

## 🚚 Module 6: Vehicles & Transport

### Features
- ✅ Vehicle fleet management
- ✅ Vehicle types (CAMION, UTILITAIRE, VOITURE)
- ✅ Load capacity tracking
- ✅ Insurance and inspection expiry tracking
- ✅ Mileage tracking
- ✅ Transport planning and tracking
- ✅ Driver assignment
- ✅ Automatic vehicle status updates
- ✅ Weight validation (total weight ≤ vehicle capacity)
- ✅ Automatic mileage updates

### Endpoints: 10
- Vehicle CRUD (5 endpoints)
- Transport Management (5 endpoints)

### Automatic Actions
- Creating transport → Vehicle status: EN_SERVICE
- Completing transport → Vehicle status: DISPONIBLE
- Mileage automatically updated on transport completion

---

## 📱 Module 7: WhatsApp Messages

### Features
- ✅ WhatsApp message sending
- ✅ Event invitation automation
- ✅ Event reminder automation
- ✅ Message status tracking (ENVOYE → LIVRE → LU → ECHOUE)
- ✅ Twilio integration ready (webhook support)
- ✅ Message history and tracking
- ✅ Bulk messaging to event technicians

### Endpoints: 7
- Message Management (4 endpoints)
- Event Automation (2 endpoints)
- Webhook (1 endpoint)

### Features
- Send individual messages
- Send invitations to all event technicians
- Send reminders for upcoming events
- Status tracking via Twilio webhooks
- Message history per event

---

## 📋 Module 8: Activity Logs

### Features
- ✅ Complete audit trail
- ✅ User action tracking
- ✅ Entity change tracking
- ✅ IP address and user agent logging
- ✅ Export to CSV
- ✅ Filtering and search capabilities
- ✅ Privacy controls (users see own logs, admins see all)

### Endpoints: 5
- Log Viewing (4 endpoints)
- Export (1 endpoint)

### Tracked Actions
- CREATE, UPDATE, DELETE operations
- LOGIN, LOGOUT
- PASSWORD_RESET, PASSWORD_CHANGED
- EMAIL_VERIFIED
- STATUS_CHANGED

---

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Refresh token rotation
- Role-based access control (RBAC)
- Account activation checks
- IP tracking for login attempts

### Rate Limiting
- Login: 5 attempts per 15 minutes
- Registration: 3 per hour
- Password reset: 3 per hour
- General API: 100 requests per 15 minutes

### Data Protection
- Password hashing (bcrypt, 12 rounds)
- Input validation on all endpoints
- SQL injection protection (Sequelize ORM)
- XSS protection (Helmet)
- CORS configuration

---

## 📧 Email System

### Email Types
- ✅ Registration welcome email
- ✅ Email verification
- ✅ Password reset
- ✅ Password changed notification
- ✅ Account creation confirmation

### Features
- HTML email templates
- Responsive design
- Development mode (console logging)
- Production ready (SMTP integration)
- Error handling

---

## 🔄 Automatic System Behaviors

### Equipment Management
- **Reservation:** Reduces `quantity_available`, creates status entry
- **Return:** Increases `quantity_available`, updates status
- **Maintenance Start:** Sets `quantity_available` to 0, status to EN_MAINTENANCE
- **Maintenance Complete:** Restores `quantity_available`, status to DISPONIBLE

### Vehicle Management
- **Transport Created:** Vehicle status → EN_SERVICE
- **Transport Completed:** Vehicle status → DISPONIBLE, mileage updated

### Event Management
- **Equipment Reservation:** Validates availability and maintenance status
- **Equipment Return:** Auto-updates quantities and status

---

## 📈 API Statistics

### Total Endpoints: **67+**

| Module | Endpoints | Authentication | Admin Only |
|--------|-----------|----------------|------------|
| Auth | 11 | All | 0 |
| Categories | 5 | All | Create/Update/Delete |
| Subcategories | 5 | All | Create/Update/Delete |
| Equipment | 7 | All | Create/Update/Delete |
| Events | 11 | All | Delete |
| Maintenance | 6 | All | Delete |
| Vehicles | 5 | All | All CRUD |
| Transports | 5 | All | Delete |
| WhatsApp | 7 | Most | 0 |
| Activity Logs | 5 | All | View All |

---

## 🎯 Key Business Rules

### Equipment Reservation
1. ✅ Check equipment exists
2. ✅ Check not in maintenance
3. ✅ Validate available quantity
4. ✅ Update equipment status
5. ✅ Create status history entry

### Maintenance Workflow
1. ✅ Create maintenance record
2. ✅ Set equipment to EN_MAINTENANCE
3. ✅ Set quantity_available to 0
4. ✅ Complete maintenance
5. ✅ Restore equipment to DISPONIBLE
6. ✅ Restore quantity_available

### Transport Workflow
1. ✅ Verify vehicle available
2. ✅ Validate weight ≤ capacity
3. ✅ Set vehicle to EN_SERVICE
4. ✅ Complete transport
5. ✅ Restore vehicle to DISPONIBLE
6. ✅ Update mileage

---

## 📚 Data Relationships

### Primary Relationships
- **Users** → Events (created_by)
- **Users** → Equipment Status (changed_by)
- **Users** → Maintenance (technician_id)
- **Users** → Transports (driver_id)
- **Categories** → Subcategories (one-to-many)
- **Categories** → Equipment (one-to-many)
- **Subcategories** → Equipment (one-to-many)
- **Equipment** → Equipment Status (one-to-many)
- **Equipment** → Event Equipment (one-to-many)
- **Equipment** → Maintenance (one-to-many)
- **Events** → Event Equipment (one-to-many)
- **Events** → Event Technicians (one-to-many)
- **Events** → Transports (one-to-many)
- **Vehicles** → Transports (one-to-many)

---

## 🚀 Production Ready Features

### Code Quality
- ✅ TypeScript for type safety
- ✅ Comprehensive validation
- ✅ Error handling middleware
- ✅ Async/await error handling
- ✅ Clean code architecture

### Performance
- ✅ Database indexing on all foreign keys
- ✅ Pagination on list endpoints
- ✅ Efficient queries with includes
- ✅ Connection pooling (Sequelize)

### Monitoring
- ✅ Activity logging
- ✅ Error logging
- ✅ Request logging (Morgan)
- ✅ Email sending logs

### Scalability
- ✅ Modular architecture
- ✅ Separation of concerns
- ✅ Reusable utilities
- ✅ Middleware composition

---

## 📊 Data Flow Examples

### Creating an Event with Equipment

1. **Create Event**
   - POST `/api/events`
   - Validates dates
   - Creates event record

2. **Reserve Equipment**
   - POST `/api/events/:id/equipment`
   - ✅ Checks equipment not in maintenance
   - ✅ Validates quantity available
   - ✅ Creates reservation
   - ✅ Updates equipment quantity_available
   - ✅ Creates equipment status entry

3. **Assign Technicians**
   - POST `/api/events/:id/technicians`
   - Creates technician assignment

4. **Send Invitations**
   - POST `/api/whatsapp-messages/event-invitation`
   - Sends WhatsApp to all technicians

### Equipment Maintenance Flow

1. **Create Maintenance**
   - POST `/api/maintenances`
   - Sets equipment to EN_MAINTENANCE
   - Sets quantity_available to 0

2. **Complete Maintenance**
   - POST `/api/maintenances/:id/complete`
   - Sets equipment to DISPONIBLE
   - Restores quantity_available
   - Records solution and cost

---

## 🔍 Search & Filtering Capabilities

### Equipment
- Search by name or reference
- Filter by category/subcategory
- Filter by status
- Pagination

### Events
- Filter by status
- Filter by category
- Filter by date range
- Pagination

### Maintenance
- Filter by equipment
- Filter by technician
- Filter by status
- Filter by priority
- Pagination

### Activity Logs
- Filter by user
- Filter by action
- Filter by entity type
- Filter by date range
- Export to CSV

---

## 📝 Summary

This backend provides a **complete, production-ready solution** for managing:

✅ **User Authentication & Authorization** - Secure, role-based access  
✅ **Equipment Inventory** - Full stock management with tracking  
✅ **Event Management** - Complete event lifecycle  
✅ **Equipment Reservations** - With availability and maintenance checks  
✅ **Maintenance Tracking** - Equipment repair and maintenance  
✅ **Transport Management** - Vehicle fleet and logistics  
✅ **Team Coordination** - Technician assignments and communication  
✅ **Communication** - WhatsApp integration for notifications  
✅ **Audit Trail** - Complete activity logging  

### Total API Endpoints: **67+**
### Database Tables: **13**
### Modules: **8**
### Security Features: **Comprehensive**
### Production Ready: **Yes**

---

**Built with:** Node.js, TypeScript, Express, PostgreSQL, Sequelize  
**Security:** JWT, bcrypt, Helmet, Rate Limiting  
**Communication:** Nodemailer, WhatsApp (Twilio ready)  
**Architecture:** RESTful API, MVC pattern, Middleware-based
