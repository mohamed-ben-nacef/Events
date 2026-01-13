import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Event from './Event';
import User from './User';

interface WhatsappMessageAttributes {
  id: string;
  recipient_phone: string;
  recipient_name: string;
  message_content: string;
  message_type?: string;
  event_id?: string;
  status: 'ENVOYE' | 'LIVRE' | 'LU' | 'ECHOUE';
  twilio_message_sid?: string;
  error_message?: string;
  sent_by: string;
  sent_at?: Date;
  delivered_at?: Date;
  read_at?: Date;
}

interface WhatsappMessageCreationAttributes extends Optional<WhatsappMessageAttributes, 'id' | 'message_type' | 'event_id' | 'status' | 'twilio_message_sid' | 'error_message' | 'sent_at' | 'delivered_at' | 'read_at'> {}

class WhatsappMessage extends Model<WhatsappMessageAttributes, WhatsappMessageCreationAttributes> implements WhatsappMessageAttributes {
  public id!: string;
  public recipient_phone!: string;
  public recipient_name!: string;
  public message_content!: string;
  public message_type!: string;
  public event_id!: string;
  public status!: 'ENVOYE' | 'LIVRE' | 'LU' | 'ECHOUE';
  public twilio_message_sid!: string;
  public error_message!: string;
  public sent_by!: string;
  public sent_at!: Date;
  public delivered_at!: Date;
  public read_at!: Date;
}

WhatsappMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    recipient_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    recipient_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message_content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    message_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Event,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('ENVOYE', 'LIVRE', 'LU', 'ECHOUE'),
      defaultValue: 'ENVOYE',
    },
    twilio_message_sid: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sent_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    sent_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'whatsapp_messages',
    timestamps: false, // Using sent_at, handled manually or by default.
    underscored: true,
    indexes: [
      { fields: ['event_id'] },
      { fields: ['status'] },
      { fields: ['sent_at'] },
      { fields: ['recipient_phone'] },
    ]
  }
);

export default WhatsappMessage;
