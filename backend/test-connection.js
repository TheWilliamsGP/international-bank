// test-connection.js
const mongoose = require('mongoose');
require('dotenv').config();

// Check if MONGODB_URI is defined
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  console.log('Current environment variables:');
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Exists' : 'Missing');
  console.log('PORT:', process.env.PORT);
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', MONGODB_URI.replace(/:[^:]*@/, ':****@'));
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected successfully');
    console.log('Database:', mongoose.connection.db.databaseName);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:');
    collections.forEach(col => console.log('  -', col.name));
    
    // Count documents in users and transactions
    const usersCount = await mongoose.connection.db.collection('users').countDocuments();
    const transactionsCount = await mongoose.connection.db.collection('transactions').countDocuments();
    
    console.log('Users count:', usersCount);
    console.log('Transactions count:', transactionsCount);
    
    await mongoose.disconnect();
    console.log('Disconnected');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();