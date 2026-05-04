import dotenv from 'dotenv';
dotenv.config();

import { sequelize, Equipment } from '../models';
import { generateQRCode } from '../utils/qrCodeGenerator';

async function migrateQRCodes() {
  try {
    console.log('🔄 Starting QR code migration to link-based format...');
    
    // Connect to DB
    await sequelize.authenticate();
    console.log('✅ Database connected.');

    const equipments = await Equipment.findAll();
    console.log(`📋 Found ${equipments.length} items to update.`);

    const appUrl = process.env.APP_URL || 'http://105.106.105.25:3000';
    let updatedCount = 0;

    for (const equipment of equipments) {
      const publicUrl = `${appUrl}/QTE/${equipment.id}`;
      console.log(`🛠  Generating QR for ${equipment.reference} -> ${publicUrl}`);
      
      try {
        const newQrCode = await generateQRCode(publicUrl);
        await equipment.update({ qr_code_url: newQrCode });
        updatedCount++;
      } catch (err) {
        console.error(`❌ Failed to update QR for ${equipment.reference}:`, err);
      }
    }

    console.log(`\n✨ Migration complete! Updated ${updatedCount}/${equipments.length} QR codes.`);
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

migrateQRCodes();
