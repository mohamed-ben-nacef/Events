import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface EventAttributes {
  id: string;
  event_name: string;
  client_name: string;
  contact_person: string;
  phone: string;
  email?: string;
  address: string;
  installation_date: Date;
  event_date: Date;
  dismantling_date: Date;
  category: 'SON' | 'VIDEO' | 'LUMIERE' | 'MIXTE';
  status: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  notes?: string;
  budget?: number;
  participant_count?: number;
  event_type?: string;
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
}

interface EventCreationAttributes extends Optional<EventAttributes, 'id' | 'email' | 'status' | 'notes' | 'budget' | 'participant_count' | 'event_type' | 'created_at' | 'updated_at'> {}

class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: string;
  public event_name!: string;
  public client_name!: string;
  public contact_person!: string;
  public phone!: string;
  public email!: string;
  public address!: string;
  public installation_date!: Date;
  public event_date!: Date;
  public dismantling_date!: Date;
  public category!: 'SON' | 'VIDEO' | 'LUMIERE' | 'MIXTE';
  public status!: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  public notes!: string;
  public budget!: number;
  public participant_count!: number;
  public event_type!: string;
  public created_by!: string;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Event.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    event_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    client_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contact_person: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    installation_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    event_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    dismantling_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('SON', 'VIDEO', 'LUMIERE', 'MIXTE'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE'),
      defaultValue: 'PLANIFIE',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    participant_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    event_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'events',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['event_date'] },
      { fields: ['installation_date'] },
      { fields: ['created_by'] },
      { fields: ['client_name'] },
    ]
  }
);

export default Event;
