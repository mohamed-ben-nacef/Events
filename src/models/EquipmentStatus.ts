import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Equipment from './Equipment';
import User from './User';
import Maintenance from './Maintenance';
import Event from './Event';

interface EquipmentStatusAttributes {
  id: string;
  equipment_id: string;
  status: 'DISPONIBLE' | 'EN_LOCATION' | 'EN_MAINTENANCE' | 'MANQUANT';
  quantity: number;
  related_event_id?: string;
  related_maintenance_id?: string;
  notes?: string;
  changed_by: string;
  changed_at?: Date;
}

interface EquipmentStatusCreationAttributes extends Optional<EquipmentStatusAttributes, 'id' | 'quantity' | 'related_event_id' | 'related_maintenance_id' | 'notes' | 'changed_at'> {}

class EquipmentStatus extends Model<EquipmentStatusAttributes, EquipmentStatusCreationAttributes> implements EquipmentStatusAttributes {
  public id!: string;
  public equipment_id!: string;
  public status!: 'DISPONIBLE' | 'EN_LOCATION' | 'EN_MAINTENANCE' | 'MANQUANT';
  public quantity!: number;
  public related_event_id!: string;
  public related_maintenance_id!: string;
  public notes!: string;
  public changed_by!: string;
  public changed_at!: Date;
}

EquipmentStatus.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    equipment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Equipment,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('DISPONIBLE', 'EN_LOCATION', 'EN_MAINTENANCE', 'MANQUANT'),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    related_event_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Event,
        key: 'id',
      },
    },
    related_maintenance_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Maintenance,
        key: 'id',
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    changed_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    changed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'equipment_status',
    timestamps: false, // We use changed_at manually essentially
    underscored: true,
    indexes: [
      { fields: ['equipment_id'] },
      { fields: ['status'] },
      { fields: ['related_event_id'] },
    ]
  }
);

export default EquipmentStatus;
