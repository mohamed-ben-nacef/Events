import { User } from './src/models';
import bcrypt from 'bcrypt';

async function updateAdmin() {
  try {
    const password = '123456';
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const [user, created] = await User.upsert({
      email: 'admin@example.com',
      password_hash: password_hash,
      full_name: 'Admin User',
      phone: '1234567890',
      role: 'ADMIN',
      is_active: true,
      is_email_verified: true,
    });

    if (created) {
      console.log('✅ Admin user created successfully.');
    } else {
      console.log('✅ Admin user updated successfully.');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating admin:', err);
    process.exit(1);
  }
}

updateAdmin();
