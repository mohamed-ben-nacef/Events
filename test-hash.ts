import { User } from './src/models/index';
import bcrypt from 'bcrypt';

async function testPassword() {
  try {
    const user = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }

    console.log('Found user hash:', user.password_hash);

    const test1 = await bcrypt.compare('123456', user.password_hash);
    console.log('compare("123456", hash):', test1);

    const test2 = await bcrypt.compare('AdminPass123!', user.password_hash);
    console.log('compare("AdminPass123!", hash):', test2);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testPassword();
