import { Sequelize } from 'sequelize';
import User from './src/models/User';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/events_db', {
  dialect: 'postgres',
  logging: false,
});

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    const users = await User.findAll();
    console.log('Users found:', users.length);
    users.forEach(user => {
      console.log(`- ${user.email} (Role: ${user.role}, Active: ${user.is_active})`);
    });

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

checkUsers();
