require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/securerestapi');
    console.log('Connected to MongoDB');

    // Admin credentials
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    
    // Delete existing admin user to recreate with fresh password hash
    await User.deleteOne({ email: adminEmail });
    
    // Create new admin user
    const admin = new User({
      name: 'Admin User',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    
    await admin.save();
    console.log('✅ Admin user created successfully');

    console.log('\n📋 Admin Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role:     admin`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔗 Admin Dashboard: http://localhost:5174/admin');
    console.log('📝 Login Page: http://localhost:5174/login');

    await mongoose.connection.close();
    console.log('\n✅ Script completed successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
