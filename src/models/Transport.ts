import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Event from './Event';
import Vehicle from './Vehicle';
import User from './User';

interface TransportAttributes {
  id: string;
  event_id: string;
  vehicle_id: string;
  driver_id: string;
  departure_address: string;
  arrival_address: string;
  departure_date: Date;
  return_date?: Date;
  departure_mileage?: number;
  arrival_mileage?: number;
  fuel_cost?: number;
  total_weight_kg?: number;
  status: 'PLANIFIE' | 'EN_ROUTE' | 'LIVRE' | 'RETOUR' | 'TERMINE';
  incidents?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface TransportCreationAttributes extends Optional<TransportAttributes, 'id' | 'return_date' | 'departure_mileage' | 'arrival_mileage' | 'fuel_cost' | 'total_weight_kg' | 'status' | 'incidents' | 'notes' | 'created_at' | 'updated_at'> {}

class Transport extends Model<TransportAttributes, TransportCreationAttributes> implements TransportAttributes {
  public id!: string;
  public event_id!: string;
  public vehicle_id!: string;
  public driver_id!: string;
  public departure_address!: string;
  public arrival_address!: string;
  public departure_date!: Date;
  public return_date!: Date;
  public departure_mileage!: number;
  public arrival_mileage!: number;
  public fuel_cost!: number;
  public total_weight_kg!: number;
  public status!: 'PLANIFIE' | 'EN_ROUTE' | 'LIVRE' | 'RETOUR' | 'TERMINE';
  public incidents!: string;
  public notes!: string;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Transport.init(
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
    },
    vehicle_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Vehicle,
        key: 'id',
      },
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    departure_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    arrival_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    departure_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    return_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    departure_mileage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    arrival_mileage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fuel_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    total_weight_kg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PLANIFIE', 'EN_ROUTE', 'LIVRE', 'RETOUR', 'TERMINE'),
      defaultValue: 'PLANIFIE',
    },
    incidents: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'transports',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['event_id'] },
      { fields: ['vehicle_id'] },
      { fields: ['driver_id'] },
      { fields: ['status'] },
    ]
  }
);

export default Transport;
