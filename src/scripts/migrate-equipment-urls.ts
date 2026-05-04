import { QueryInterface, DataTypes } from 'sequelize';
import sequelize from '../config/database';

async function migrate() {
  const qi: QueryInterface = sequelize.getQueryInterface();

  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected.\n');

    console.log('Changing "qr_code_url" to TEXT...');
    await qi.changeColumn('equipment', 'qr_code_url', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    console.log('✅  "qr_code_url" changed to TEXT.');

    console.log('Changing "manual_url" to TEXT...');
    await qi.changeColumn('equipment', 'manual_url', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    console.log('✅  "manual_url" changed to TEXT.');

    console.log('\n✔  Migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
