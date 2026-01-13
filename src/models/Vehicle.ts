import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface VehicleAttributes {
  id: string;
  registration_number: string;
  type: 'CAMION' | 'UTILITAIRE' | 'VOITURE';
  brand: string;
  model: string;
  load_capacity_kg: number;
  cargo_dimensions?: string;
  photo_url?: string;
  insurance_expiry?: Date;
  technical_inspection_expiry?: Date;
  fuel_type?: string;
  current_mileage?: number;
  status: 'DISPONIBLE' | 'EN_SERVICE' | 'EN_MAINTENANCE';
  created_at?: Date;
  updated_at?: Date;
}

interface VehicleCreationAttributes extends Optional<VehicleAttributes, 'id' | 'cargo_dimensions' | 'photo_url' | 'insurance_expiry' | 'technical_inspection_expiry' | 'fuel_type' | 'current_mileage' | 'status' | 'created_at' | 'updated_at'> {}

class Vehicle extends Model<VehicleAttributes, VehicleCreationAttributes> implements VehicleAttributes {
  public id!: string;
  public registration_number!: string;
  public type!: 'CAMION' | 'UTILITAIRE' | 'VOITURE';
  public brand!: string;
  public model!: string;
  public load_capacity_kg!: number;
  public cargo_dimensions!: string;
  public photo_url!: string;
  public insurance_expiry!: Date;
  public technical_inspection_expiry!: Date;
  public fuel_type!: string;
  public current_mileage!: number;
  public status!: 'DISPONIBLE' | 'EN_SERVICE' | 'EN_MAINTENANCE';
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Vehicle.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    registration_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM('CAMION', 'UTILITAIRE', 'VOITURE'),
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    load_capacity_kg: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
    },
    cargo_dimensions: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    photo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    insurance_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    technical_inspection_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    fuel_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    current_mileage: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('DISPONIBLE', 'EN_SERVICE', 'EN_MAINTENANCE'),
      defaultValue: 'DISPONIBLE',
    },
  },
  {
    sequelize,
    tableName: 'vehicles',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['registration_number'] },
      { fields: ['status'] },
    ]
  }
);

export default Vehicle;
