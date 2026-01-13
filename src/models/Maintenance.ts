import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Equipment from './Equipment';
import User from './User';

interface MaintenanceAttributes {
  id: string;
  equipment_id: string;
  problem_description: string;
  technician_id: string;
  priority: 'BASSE' | 'MOYENNE' | 'HAUTE';
  start_date: Date;
  expected_end_date?: Date;
  actual_end_date?: Date;
  cost?: number;
  status: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE';
  solution_description?: string;
  photos?: string[];
  created_at?: Date;
  updated_at?: Date;
}

interface MaintenanceCreationAttributes extends Optional<MaintenanceAttributes, 'id' | 'priority' | 'expected_end_date' | 'actual_end_date' | 'cost' | 'status' | 'solution_description' | 'photos' | 'created_at' | 'updated_at'> {}

class Maintenance extends Model<MaintenanceAttributes, MaintenanceCreationAttributes> implements MaintenanceAttributes {
  public id!: string;
  public equipment_id!: string;
  public problem_description!: string;
  public technician_id!: string;
  public priority!: 'BASSE' | 'MOYENNE' | 'HAUTE';
  public start_date!: Date;
  public expected_end_date!: Date;
  public actual_end_date!: Date;
  public cost!: number;
  public status!: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE';
  public solution_description!: string;
  public photos!: string[];
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Maintenance.init(
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
    },
    problem_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    technician_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    priority: {
      type: DataTypes.ENUM('BASSE', 'MOYENNE', 'HAUTE'),
      defaultValue: 'MOYENNE',
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    expected_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    actual_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('EN_ATTENTE', 'EN_COURS', 'TERMINE'),
      defaultValue: 'EN_ATTENTE',
    },
    solution_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'maintenances',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['equipment_id'] },
      { fields: ['technician_id'] },
      { fields: ['status'] },
      { fields: ['priority'] },
    ]
  }
);

export default Maintenance;
