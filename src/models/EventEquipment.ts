import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Event from './Event';
import Equipment from './Equipment';

interface EventEquipmentAttributes {
  id: string;
  event_id: string;
  equipment_id: string;
  quantity_reserved: number;
  quantity_returned: number;
  status: 'RESERVE' | 'LIVRE' | 'RETOURNE';
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface EventEquipmentCreationAttributes extends Optional<EventEquipmentAttributes, 'id' | 'quantity_returned' | 'status' | 'notes' | 'created_at' | 'updated_at'> {}

class EventEquipment extends Model<EventEquipmentAttributes, EventEquipmentCreationAttributes> implements EventEquipmentAttributes {
  public id!: string;
  public event_id!: string;
  public equipment_id!: string;
  public quantity_reserved!: number;
  public quantity_returned!: number;
  public status!: 'RESERVE' | 'LIVRE' | 'RETOURNE';
  public notes!: string;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

EventEquipment.init(
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
    equipment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Equipment,
        key: 'id',
      },
    },
    quantity_reserved: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity_returned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('RESERVE', 'LIVRE', 'RETOURNE'),
      defaultValue: 'RESERVE',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'event_equipment',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['event_id'] },
      { fields: ['equipment_id'] },
      { 
        unique: true, 
        fields: ['event_id', 'equipment_id'] 
      },
    ]
  }
);

export default EventEquipment;
