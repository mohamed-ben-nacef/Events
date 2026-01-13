import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Event from './Event';
import User from './User';

interface EventTechnicianAttributes {
  id: string;
  event_id: string;
  technician_id: string;
  role?: string;
  is_prepared: boolean;
  prepared_at?: Date;
  created_at?: Date;
}

interface EventTechnicianCreationAttributes extends Optional<EventTechnicianAttributes, 'id' | 'role' | 'is_prepared' | 'prepared_at' | 'created_at'> {}

class EventTechnician extends Model<EventTechnicianAttributes, EventTechnicianCreationAttributes> implements EventTechnicianAttributes {
  public id!: string;
  public event_id!: string;
  public technician_id!: string;
  public role!: string;
  public is_prepared!: boolean;
  public prepared_at!: Date;
  
  public readonly created_at!: Date;
}

EventTechnician.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Event,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    technician_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    role: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    is_prepared: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    prepared_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'event_technicians',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ['event_id'] },
      { fields: ['technician_id'] },
      { 
        unique: true, 
        fields: ['event_id', 'technician_id'] 
      },
    ]
  }
);

export default EventTechnician;
