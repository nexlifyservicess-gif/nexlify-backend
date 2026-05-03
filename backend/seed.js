// seed.js
require('dotenv').config();  // ← ADD THIS LINE

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'unilearnxyz@gmail.com';
    const adminPassword = '87654321';

    const existing = await User.findOne({ email: adminEmail });

    if (existing) {
      console.log('✅ Admin already exists — updating password');
      existing.password = adminPassword;
      await existing.save();
      console.log('✅ Admin password updated');
    } else {
      await User.create({
        email: adminEmail,
        password: adminPassword,
      });
      console.log('✅ Admin user created successfully');
    }
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

seedAdmin();