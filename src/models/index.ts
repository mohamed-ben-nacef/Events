import sequelize from '../config/database';
import User from './User';
import Category from './Category';
import Subcategory from './Subcategory';
import Equipment from './Equipment';
import EquipmentStatus from './EquipmentStatus';
import Event from './Event';
import EventEquipment from './EventEquipment';
import EventTechnician from './EventTechnician';
import Maintenance from './Maintenance';
import Vehicle from './Vehicle';
import Transport from './Transport';
import WhatsappMessage from './WhatsappMessage';
import ActivityLog from './ActivityLog';
import MaintenanceLog from './MaintenanceLog';

// --- AUTHENTICATION & USERS ---
// No extra relations for now apart from those below

// --- CATEGORIES & SUBCATEGORIES ---
Category.hasMany(Subcategory, { foreignKey: 'category_id', as: 'subcategories' });
Subcategory.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// --- EQUIPMENT (STOCK) ---
Category.hasMany(Equipment, { foreignKey: 'category_id', as: 'equipment' });
Equipment.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Subcategory.hasMany(Equipment, { foreignKey: 'subcategory_id', as: 'equipment' });
Equipment.belongsTo(Subcategory, { foreignKey: 'subcategory_id', as: 'subcategory' });

Equipment.hasMany(EquipmentStatus, { foreignKey: 'equipment_id', as: 'status_history' });
EquipmentStatus.belongsTo(Equipment, { foreignKey: 'equipment_id', as: 'equipment' });

User.hasMany(EquipmentStatus, { foreignKey: 'changed_by', as: 'equipment_status_changes' });
EquipmentStatus.belongsTo(User, { foreignKey: 'changed_by', as: 'changer' });

// --- EVENTS (LOCATIONS) ---
User.hasMany(Event, { foreignKey: 'created_by', as: 'created_events' });
Event.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Event.hasMany(EquipmentStatus, { foreignKey: 'related_event_id', as: 'equipment_statuses' });
EquipmentStatus.belongsTo(Event, { foreignKey: 'related_event_id', as: 'related_event' });

Event.hasMany(EventEquipment, { foreignKey: 'event_id', as: 'equipment_reservations' });
EventEquipment.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

Equipment.hasMany(EventEquipment, { foreignKey: 'equipment_id', as: 'event_reservations' });
EventEquipment.belongsTo(Equipment, { foreignKey: 'equipment_id', as: 'equipment' });

Event.hasMany(EventTechnician, { foreignKey: 'event_id', as: 'technician_assignments' });
EventTechnician.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

User.hasMany(EventTechnician, { foreignKey: 'technician_id', as: 'event_assignments' });
EventTechnician.belongsTo(User, { foreignKey: 'technician_id', as: 'technician' });

// --- MAINTENANCE ---
Equipment.hasMany(Maintenance, { foreignKey: 'equipment_id', as: 'maintenances' });
Maintenance.belongsTo(Equipment, { foreignKey: 'equipment_id', as: 'equipment' });

User.hasMany(Maintenance, { foreignKey: 'technician_id', as: 'assigned_maintenances' });
Maintenance.belongsTo(User, { foreignKey: 'technician_id', as: 'technician' });

Maintenance.hasMany(EquipmentStatus, { foreignKey: 'related_maintenance_id', as: 'equipment_statuses' });
EquipmentStatus.belongsTo(Maintenance, { foreignKey: 'related_maintenance_id', as: 'related_maintenance' });

Maintenance.hasMany(MaintenanceLog, { foreignKey: 'maintenance_id', as: 'logs' });
MaintenanceLog.belongsTo(Maintenance, { foreignKey: 'maintenance_id', as: 'maintenance' });
MaintenanceLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// --- VEHICLES & TRANSPORT ---
Event.hasMany(Transport, { foreignKey: 'event_id', as: 'transports' });
Transport.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

Vehicle.hasMany(Transport, { foreignKey: 'vehicle_id', as: 'transports' });
Transport.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

User.hasMany(Transport, { foreignKey: 'driver_id', as: 'driven_transports' });
Transport.belongsTo(User, { foreignKey: 'driver_id', as: 'driver' });

// --- WHATSAPP MESSAGES ---
Event.hasMany(WhatsappMessage, { foreignKey: 'event_id', as: 'whatsapp_messages' });
WhatsappMessage.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

User.hasMany(WhatsappMessage, { foreignKey: 'sent_by', as: 'sent_whatsapp_messages' });
WhatsappMessage.belongsTo(User, { foreignKey: 'sent_by', as: 'sender' });

// --- ACTIVITY LOGS ---
User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'activity_logs' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export {
  sequelize,
  User,
  Category,
  Subcategory,
  Equipment,
  EquipmentStatus,
  Event,
  EventEquipment,
  EventTechnician,
  Maintenance,
  Vehicle,
  Transport,
  WhatsappMessage,
  ActivityLog,
  MaintenanceLog,
};

