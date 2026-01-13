import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Category from './Category';

interface SubcategoryAttributes {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface SubcategoryCreationAttributes extends Optional<SubcategoryAttributes, 'id' | 'description' | 'created_at' | 'updated_at'> {}

class Subcategory extends Model<SubcategoryAttributes, SubcategoryCreationAttributes> implements SubcategoryAttributes {
  public id!: string;
  public category_id!: string;
  public name!: string;
  public description!: string;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Subcategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Category,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'subcategories',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['category_id'] },
      { 
        unique: true, 
        fields: ['category_id', 'name'] 
      },
    ]
  }
);

export default Subcategory;
