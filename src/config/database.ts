
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL is not defined in .env file');
}

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: false,
});

export default sequelize;
