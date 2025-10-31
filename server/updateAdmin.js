import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cyberscripts';

const updateAdminCredentials = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete old admin if exists
    await User.deleteMany({ $or: [
      { email: 'admin@cyberscripts.com' },
      { email: 'ram@admin.com' }
    ]});

    // Create new admin user with new credentials
    const adminUser = await User.create({
      name: 'Ram',
      email: 'ram@admin.com',
      password: 'Ramram8890@',
      role: 'admin',
      emailVerified: true,
      isActive: true
    });

    console.log('\n🎉 Admin credentials updated successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email/Username: ram@admin.com');
    console.log('   (Login with: ram@admin.com)');
    console.log('🔑 Password: Ramram8890@');
    console.log('👤 Name:     Ram');
    console.log('👤 Role:     admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

updateAdminCredentials();
