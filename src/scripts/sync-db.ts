import { sequelize } from '../models';

async function syncDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    console.log('Syncing database (alter: true)...');
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully. All tables and columns updated.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
}

syncDatabase();
