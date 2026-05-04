import { execSync } from 'child_process';
import path from 'path';

async function runMigrations() {
  const scripts = [
    'migrate-equipment-columns.ts',
    'migrate-equipment-qr-links.ts'
  ];

  console.log('🚀 Starting Universal Migration...');

  for (const script of scripts) {
    const scriptPath = path.join(__dirname, script);
    console.log(`\n📦 Running: ${script}...`);
    try {
      execSync(`npx ts-node --transpile-only ${scriptPath}`, { stdio: 'inherit' });
      console.log(`✅ ${script} finished successfully.`);
    } catch (error) {
      console.error(`❌ Error running ${script}. Stopping migrations.`);
      process.exit(1);
    }
  }

  console.log('\n✨ All migrations completed successfully!');
}

runMigrations();
