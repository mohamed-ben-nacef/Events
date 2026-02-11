import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Maintenance from './Maintenance';
import User from './User';

interface MaintenanceLogAttributes {
  id: string;
  maintenance_id: string;
  user_id: string;
  content: string;
  photos?: string[];
  type: 'COMMENT' | 'STATUS_CHANGE';
  created_at?: Date;
  updated_at?: Date;
}

interface MaintenanceLogCreationAttributes extends Optional<MaintenanceLogAttributes, 'id' | 'photos' | 'created_at' | 'updated_at'> { }

class MaintenanceLog extends Model<MaintenanceLogAttributes, MaintenanceLogCreationAttributes> implements MaintenanceLogAttributes {
  public id!: string;
  public maintenance_id!: string;
  public user_id!: string;
  public content!: string;
  public photos!: string[];
  public type!: 'COMMENT' | 'STATUS_CHANGE';

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

MaintenanceLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    maintenance_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Maintenance,
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('COMMENT', 'STATUS_CHANGE'),
      defaultValue: 'COMMENT',
    },
  },
  {
    sequelize,
    tableName: 'maintenance_logs',
    timestamps: true,
    underscored: true,
  }
);

export default MaintenanceLog;
