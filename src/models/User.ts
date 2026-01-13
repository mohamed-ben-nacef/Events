import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string;
  profile_picture?: string;
  role: 'ADMIN' | 'MAINTENANCE' | 'TECHNICIEN';
  is_active: boolean;
  is_email_verified: boolean;
  reset_password_token?: string;
  reset_password_expires?: Date;
  email_verification_token?: string;
  email_verification_expires?: Date;
  refresh_token?: string;
  refresh_token_expires?: Date;
  last_login_at?: Date;
  last_login_ip?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'profile_picture' | 'role' | 'is_active' | 'is_email_verified' | 'reset_password_token' | 'reset_password_expires' | 'email_verification_token' | 'email_verification_expires' | 'refresh_token' | 'refresh_token_expires' | 'last_login_at' | 'last_login_ip' | 'created_at' | 'updated_at'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password_hash!: string;
  public full_name!: string;
  public phone!: string;
  public profile_picture!: string;
  public role!: 'ADMIN' | 'MAINTENANCE' | 'TECHNICIEN';
  public is_active!: boolean;
  public is_email_verified!: boolean;
  public reset_password_token!: string;
  public reset_password_expires!: Date;
  public email_verification_token!: string;
  public email_verification_expires!: Date;
  public refresh_token!: string;
  public refresh_token_expires!: Date;
  public last_login_at!: Date;
  public last_login_ip!: string;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    profile_picture: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'MAINTENANCE', 'TECHNICIEN'),
      defaultValue: 'TECHNICIEN',
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reset_password_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    email_verification_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email_verification_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refresh_token_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_login_ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true, // This will automatically map camelCase fields to snake_case columns (e.g. createdAt -> created_at)
    indexes: [
      { fields: ['email'] },
      { fields: ['role'] },
      { fields: ['is_active'] },
    ]
  }
);

export default User;
