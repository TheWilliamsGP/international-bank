// createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User'); // adjust path

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'Admin123!', 
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin created successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
