// Import models from index to ensure they are all initialized and associated
import { Equipment, sequelize } from '../models';
import { Op } from 'sequelize';
import { generateQRCode } from '../utils/qrCodeGenerator';

async function generateMissingQRCodes() {
  try {
    console.log('Starting QR code generation script...');

    // Initialize DB connection
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    const equipmentWithNoQR = await Equipment.findAll({
      where: {
        qr_code_url: null as any
      }
    });

    console.log(`Found ${equipmentWithNoQR.length} equipment(s) without QR code.`);

    for (const item of equipmentWithNoQR) {
      console.log(`Generating QR code for ${item.name} (${item.reference})...`);
      try {
        const qr_code_url = await generateQRCode(item.reference);
        await item.update({ qr_code_url });
        console.log(`✅ Generated for ${item.reference}`);
      } catch (err) {
        console.error(`❌ Failed for ${item.reference}:`, err);
      }
    }

    console.log('Finished processing all equipment.');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error generating missing QR codes:', error);
    process.exit(1);
  }
}

generateMissingQRCodes();
