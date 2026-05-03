require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Service = require('./models/Service');
const Project = require('./models/Project');

const seedData = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB Connected');

    // ========== SEED ADMIN USER ==========
    const adminEmail = 'unilearnxyz@gmail.com';
    const adminPassword = '87654321';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('👤 Admin exists — updating password');
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
      console.log('✅ Admin password updated');
    } else {
      await User.create({
        email: adminEmail,
        password: adminPassword,
      });
      console.log('✅ Admin user created');
    }

    // ========== SEED SAMPLE SERVICES ==========
    const servicesCount = await Service.countDocuments();
    if (servicesCount === 0) {
      await Service.insertMany([
        {
          title: 'Web Development',
          description: 'Custom websites built with modern technologies.',
          icon: 'Globe',
          features: ['Responsive Design', 'SEO Optimized', 'Fast Performance'],
        },
        {
          title: 'Mobile Apps',
          description: 'Native and cross-platform mobile applications.',
          icon: 'Smartphone',
          features: ['iOS & Android', 'Push Notifications', 'Offline Support'],
        },
        {
          title: 'UI/UX Design',
          description: 'Beautiful, intuitive interfaces that users love.',
          icon: 'Palette',
          features: ['User Research', 'Wireframing', 'Prototyping'],
        },
      ]);
      console.log('✅ 3 sample services added');
    } else {
      console.log(`📦 ${servicesCount} services already exist — skipping`);
    }

    // ========== SEED SAMPLE PROJECTS ==========
    const projectsCount = await Project.countDocuments();
    if (projectsCount === 0) {
      await Project.insertMany([
        {
          title: 'E-Commerce Platform',
          description: 'A full-featured online store with payment integration.',
          category: 'Web Development',
          image: '/uploads/project1.jpg',
          technologies: ['React', 'Node.js', 'MongoDB'],
          featured: true,
        },
        {
          title: 'Fitness Tracking App',
          description: 'Mobile app for tracking workouts and nutrition.',
          category: 'Mobile App',
          image: '/uploads/project2.jpg',
          technologies: ['React Native', 'Firebase'],
          featured: true,
        },
      ]);
      console.log('✅ 2 sample projects added');
    } else {
      console.log(`📦 ${projectsCount} projects already exist — skipping`);
    }

    console.log('\n🌱 Seeding complete!');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

seedData();
