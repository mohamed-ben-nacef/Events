import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Category from './Category';
import Subcategory from './Subcategory';

interface EquipmentAttributes {
  id: string;
  name: string;
  reference: string;
  category_id: string;
  subcategory_id?: string;
  brand?: string;
  model?: string;
  description?: string;
  technical_specs?: string;
  quantity_total: number;
  quantity_available: number;
  purchase_price?: number;
  daily_rental_price?: number;
  purchase_date?: Date;
  warranty_end_date?: Date;
  supplier?: string;
  weight_kg?: number;
  qr_code_url?: string;
  photos?: string[];
  manual_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface EquipmentCreationAttributes extends Optional<EquipmentAttributes, 'id' | 'subcategory_id' | 'brand' | 'model' | 'description' | 'technical_specs' | 'quantity_total' | 'quantity_available' | 'purchase_price' | 'daily_rental_price' | 'purchase_date' | 'warranty_end_date' | 'supplier' | 'weight_kg' | 'qr_code_url' | 'photos' | 'manual_url' | 'created_at' | 'updated_at'> {}

class Equipment extends Model<EquipmentAttributes, EquipmentCreationAttributes> implements EquipmentAttributes {
  public id!: string;
  public name!: string;
  public reference!: string;
  public category_id!: string;
  public subcategory_id!: string;
  public brand!: string;
  public model!: string;
  public description!: string;
  public technical_specs!: string;
  public quantity_total!: number;
  public quantity_available!: number;
  public purchase_price!: number;
  public daily_rental_price!: number;
  public purchase_date!: Date;
  public warranty_end_date!: Date;
  public supplier!: string;
  public weight_kg!: number;
  public qr_code_url!: string;
  public photos!: string[];
  public manual_url!: string;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Equipment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    reference: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Category,
        key: 'id',
      },
    },
    subcategory_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Subcategory,
        key: 'id',
      },
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    technical_specs: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    quantity_total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    quantity_available: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    purchase_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    daily_rental_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    purchase_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    warranty_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    supplier: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    weight_kg: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    qr_code_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
    manual_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'equipment',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['reference'] },
      { fields: ['category_id'] },
      { fields: ['subcategory_id'] },
      { fields: ['name'] },
    ]
  }
);

export default Equipment;
