import { QueryInterface, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Equipment } from '../models';
import { generateQRCode } from '../utils/qrCodeGenerator';
import dotenv from 'dotenv';

// Load env if not already loaded
dotenv.config();

/**
 * Universal Migration Script
 * Handles both schema updates and data migrations (like QR code links)
 */
async function runMigration() {
  const qi: QueryInterface = sequelize.getQueryInterface();

  try {
    console.log('🚀 Starting Universal Migration...');
    console.log('📡 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected.\n');

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. SCHEMA UPDATES
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('📦 Phase 1: Schema Updates...');

    // Equipment table new columns
    const equipmentDesc = await qi.describeTable('equipment');
    const equipmentCols = Object.keys(equipmentDesc);
    
    const newEquipmentCols = [
      { name: 'quantity_broken', type: DataTypes.INTEGER, defaultValue: 0 },
      { name: 'quantity_in_maintenance', type: DataTypes.INTEGER, defaultValue: 0 },
      { name: 'quantity_in_rental', type: DataTypes.INTEGER, defaultValue: 0 },
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
        console.log(`  ➕  Column "${col.name}" added to equipment.`);
      }
    }

    // Increase URL column length to TEXT
    console.log('  🛠  Updating URL column types to TEXT...');
    await qi.changeColumn('equipment', 'qr_code_url', { type: DataTypes.TEXT, allowNull: true });
    await qi.changeColumn('equipment', 'manual_url', { type: DataTypes.TEXT, allowNull: true });

    // EventEquipment table new columns
    const eventEqDesc = await qi.describeTable('event_equipment');
    const eventEqCols = Object.keys(eventEqDesc);

    if (!eventEqCols.includes('lots_reserved')) {
      await qi.addColumn('event_equipment', 'lots_reserved', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
      console.log('  ➕  Column "lots_reserved" added to event_equipment.');
    }

    if (!eventEqCols.includes('items_broken')) {
      await qi.addColumn('event_equipment', 'items_broken', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
      console.log('  ➕  Column "items_broken" added to event_equipment.');
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. DATA MIGRATION (QR CODES)
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n🔗 Phase 2: QR Code Link Migration...');
    
    const appUrl = process.env.APP_URL || 'http://105.106.105.25:3000';
    const equipments = await Equipment.findAll();
    let updatedCount = 0;

    for (const equipment of equipments) {
      // Check if it's already a link or still just a reference
      // (Links start with http, references probably don't in the QR barcode data)
      // Actually, we force update all to be sure they point to the correct QTE page.
      const publicUrl = `${appUrl}/QTE/${equipment.id}`;
      
      try {
        const newQrCode = await generateQRCode(publicUrl);
        await equipment.update({ qr_code_url: newQrCode });
        updatedCount++;
      } catch (err) {
        console.error(`  ❌ Failed to update QR for ${equipment.reference}:`, err);
      }
    }
    console.log(`  ✅ Updated ${updatedCount}/${equipments.length} QR codes.`);


    console.log('\n✨ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
