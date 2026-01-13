# 🎬 Audiovisual Event Manager - Backend Overview

## 📋 What This Backend Offers

A **complete, production-ready REST API** for managing an audiovisual equipment rental business. This system handles everything from user authentication to equipment tracking, event management, maintenance, transportation, and team communication.

---

## 🎯 Core Capabilities

### 1. **User & Authentication Management**
- Secure user registration and login
- JWT-based authentication (access + refresh tokens)
- Password reset via email
- Email verification system
- Role-based access control (Admin, Maintenance, Technicien)
- Profile management
- Account activation/deactivation
- Activity tracking

**Data Managed:**
- User accounts with roles
- Authentication tokens
- Login history and IP tracking
- Email verification status

---

### 2. **Equipment Inventory System**
- Complete equipment catalog management
- Auto-generated unique references (EQ-SON-001, EQ-VIDEO-001, etc.)
- Real-time stock tracking (total vs available quantities)
- Equipment categorization (SON, VIDEO, LUMIERE)
- Subcategory organization
- Equipment details (brand, model, specs, photos, manuals)
- QR code support
- Price management (purchase & rental prices)
- Equipment status history tracking

**Data Managed:**
- Equipment inventory with all specifications
- Quantity tracking (total, available, reserved)
- Equipment status history
- Category and subcategory organization

**Key Features:**
- Automatic reference generation
- Quantity availability calculation
- Status change tracking with user attribution
- Search and filtering capabilities

---

### 3. **Event Management System**
- Complete event lifecycle management
- Client and contact information management
- Event scheduling (installation, event, dismantling dates)
- Event categorization (SON, VIDEO, LUMIERE, MIXTE)
- Budget and participant tracking
- Event status management (PLANIFIE → EN_COURS → TERMINE)

**Data Managed:**
- Event records with full details
- Client information
- Event dates and locations
- Event budgets and participant counts

**Key Features:**
- Date validation (installation ≤ event ≤ dismantling)
- Status workflow management
- Event search and filtering

---

### 4. **Equipment Reservation System**
- Equipment reservation for events
- **Automatic availability validation**
- **Maintenance status checking** (prevents reserving equipment in maintenance)
- **Quantity validation** (ensures sufficient stock)
- Reservation status tracking (RESERVE → LIVRE → RETOURNE)
- Equipment return management
- Automatic quantity updates

**Data Managed:**
- Equipment reservations per event
- Reserved vs returned quantities
- Reservation status
- Equipment availability updates

**Critical Validations:**
- ✅ Checks equipment is NOT in maintenance
- ✅ Validates available quantity ≥ requested quantity
- ✅ Prevents double reservations
- ✅ Auto-updates equipment status and quantities

---

### 5. **Technician Management**
- Technician assignment to events
- Role assignment (Chef équipe, Technicien son, etc.)
- Preparation status tracking
- Technician availability management

**Data Managed:**
- Technician assignments per event
- Preparation status
- Role assignments

---

### 6. **Maintenance Management**
- Complete maintenance record keeping
- Priority levels (BASSE, MOYENNE, HAUTE)
- Status tracking (EN_ATTENTE → EN_COURS → TERMINE)
- Problem and solution documentation
- Cost tracking
- Photo documentation (damage & repair)
- **Automatic equipment status updates**

**Data Managed:**
- Maintenance records
- Equipment maintenance history
- Maintenance costs
- Technician assignments for maintenance

**Automatic Behaviors:**
- Creating maintenance → Equipment status: EN_MAINTENANCE
- Completing maintenance → Equipment status: DISPONIBLE
- Equipment quantities automatically managed

---

### 7. **Vehicle & Transport Management**
- Vehicle fleet management
- Vehicle types (CAMION, UTILITAIRE, VOITURE)
- Load capacity and dimension tracking
- Insurance and inspection expiry tracking
- Mileage tracking
- Transport planning and execution
- Driver assignment
- **Weight validation** (total weight ≤ vehicle capacity)
- **Automatic vehicle status updates**
- **Automatic mileage updates**

**Data Managed:**
- Vehicle fleet information
- Transport records
- Driver assignments
- Mileage tracking
- Fuel costs

**Automatic Behaviors:**
- Creating transport → Vehicle status: EN_SERVICE
- Completing transport → Vehicle status: DISPONIBLE, mileage updated

---

### 8. **WhatsApp Communication System**
- WhatsApp message sending
- Event invitation automation
- Event reminder automation
- Message status tracking (ENVOYE → LIVRE → LU → ECHOUE)
- Twilio integration ready
- Message history per event
- Bulk messaging to technicians

**Data Managed:**
- WhatsApp message records
- Message delivery status
- Twilio tracking IDs
- Message history

---

### 9. **Activity Logging & Audit Trail**
- Complete system activity tracking
- User action logging
- Entity change tracking
- IP address and user agent logging
- Export to CSV
- Privacy controls (users see own, admins see all)

**Data Managed:**
- All system activities
- User actions
- Entity changes
- Access logs

---

## 🔄 Automatic System Behaviors

### Equipment Lifecycle
1. **Equipment Created** → Status: DISPONIBLE, quantity_available = quantity_total
2. **Reserved for Event** → quantity_available decreases, status: EN_LOCATION
3. **Sent to Maintenance** → quantity_available = 0, status: EN_MAINTENANCE
4. **Maintenance Complete** → quantity_available restored, status: DISPONIBLE
5. **Returned from Event** → quantity_available increases, status: DISPONIBLE

### Vehicle Lifecycle
1. **Vehicle Created** → Status: DISPONIBLE
2. **Assigned to Transport** → Status: EN_SERVICE
3. **Transport Completed** → Status: DISPONIBLE, mileage updated

### Event Lifecycle
1. **Event Created** → Status: PLANIFIE
2. **Equipment Reserved** → Validates availability and maintenance status
3. **Event Started** → Status: EN_COURS
4. **Equipment Returned** → Quantities restored
5. **Event Completed** → Status: TERMINE

---

## 📊 Data Relationships & Integrity

### Key Relationships
- **Users** can create events, manage equipment, perform maintenance
- **Equipment** belongs to categories/subcategories
- **Equipment** can be reserved for events
- **Equipment** can be in maintenance
- **Events** have equipment reservations and technician assignments
- **Events** have transports
- **Vehicles** are used for transports
- **All actions** are logged in activity logs

### Data Integrity
- ✅ Foreign key constraints
- ✅ Cascade deletes where appropriate
- ✅ Unique constraints (references, registration numbers)
- ✅ Validation at API level
- ✅ Database-level constraints

---

## 🔒 Security & Access Control

### Authentication
- JWT-based authentication
- Refresh token rotation
- Token expiration management
- Secure password storage (bcrypt)

### Authorization
- Role-based access control
- Admin: Full access
- Maintenance: Equipment and maintenance management
- Technicien: View and basic operations

### Protection
- Rate limiting on sensitive endpoints
- Input validation on all endpoints
- SQL injection protection
- XSS protection
- CORS configuration

---

## 📈 System Statistics

- **Total API Endpoints:** 67+
- **Database Tables:** 13
- **Modules:** 8
- **Authentication Methods:** JWT
- **Email Templates:** 4
- **Status Workflows:** Multiple
- **Automatic Validations:** Comprehensive

---

## 🎯 Business Value

### For Equipment Rental Business
✅ **Complete Inventory Management** - Track all equipment with real-time availability  
✅ **Event Coordination** - Manage events from planning to completion  
✅ **Maintenance Tracking** - Keep equipment in optimal condition  
✅ **Transport Logistics** - Manage vehicle fleet and deliveries  
✅ **Team Communication** - Automated WhatsApp notifications  
✅ **Audit Trail** - Complete history of all operations  
✅ **Availability Validation** - Prevents overbooking and maintenance conflicts  
✅ **Automated Workflows** - Reduces manual work and errors  

### Key Differentiators
1. **Intelligent Availability Checking** - Automatically prevents reserving equipment in maintenance
2. **Real-time Quantity Tracking** - Always accurate stock levels
3. **Automatic Status Updates** - Equipment and vehicle status managed automatically
4. **Complete Audit Trail** - Every action is logged
5. **Production Ready** - Built with security and scalability in mind

---

## 🚀 Ready for Production

✅ TypeScript for type safety  
✅ Comprehensive error handling  
✅ Input validation on all endpoints  
✅ Security best practices  
✅ Database indexing for performance  
✅ Pagination for large datasets  
✅ Email integration  
✅ Activity logging  
✅ Rate limiting  
✅ Clean architecture  

---

## 📚 Documentation

- Complete API documentation for all modules
- Testing files for each module
- Environment variable documentation
- Security guidelines
- Business logic explanations

---

**This backend provides everything needed to run a professional audiovisual equipment rental business efficiently and securely.**
