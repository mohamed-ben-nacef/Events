import { QueryInterface, DataTypes } from 'sequelize';
import sequelize from '../config/database';

async function migrate() {
  const qi: QueryInterface = sequelize.getQueryInterface();

  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected.\n');

    // 1. Add new columns to equipment table
    const equipmentDesc = await qi.describeTable('equipment');
    const equipmentCols = Object.keys(equipmentDesc);
    
    const newEquipmentCols = [
      { name: 'quantity_broken', type: DataTypes.INTEGER, defaultValue: 0 },
      { name: 'is_lot_based', type: DataTypes.BOOLEAN, defaultValue: false },
      { name: 'items_per_lot', type: DataTypes.INTEGER, defaultValue: 1 }
    ];

    for (const col of newEquipmentCols) {
      if (!equipmentCols.includes(col.name)) {
        await qi.addColumn('equipment', col.name, {
          type: col.type,
          allowNull: false,
          defaultValue: col.defaultValue,
        });
        console.log(`➕  Column "${col.name}" added to equipment.`);
      }
    }

    // 2. Increase URL column lengths
    console.log('Updating URL column types to TEXT...');
    await qi.changeColumn('equipment', 'qr_code_url', { type: DataTypes.TEXT, allowNull: true });
    await qi.changeColumn('equipment', 'manual_url', { type: DataTypes.TEXT, allowNull: true });
    console.log('✅  URL columns updated to TEXT.');

    // 3. Update event_equipment table
    const eventEqDesc = await qi.describeTable('event_equipment');
    const eventEqCols = Object.keys(eventEqDesc);

    if (!eventEqCols.includes('lots_reserved')) {
      await qi.addColumn('event_equipment', 'lots_reserved', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
      console.log('➕  Column "lots_reserved" added to event_equipment.');
    }

    if (!eventEqCols.includes('items_broken')) {
      await qi.addColumn('event_equipment', 'items_broken', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
      console.log('➕  Column "items_broken" added to event_equipment.');
    }

    console.log('\n✔  All migrations complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
