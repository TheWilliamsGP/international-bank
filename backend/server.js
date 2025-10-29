const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


require('dotenv').config();

console.log('Environment check:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'EXISTS' : 'MISSING');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'EXISTS' : 'MISSING');
console.log('PORT:', process.env.PORT || 'NOT SET');

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');

const app = express();

app.use(helmet());

module.exports = { bruteforce, bruteforceStrict };

const limiter = rateLimit({ windowMs: 15*60*1000, max: 100 });
app.use('/api', limiter);

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/international-bank';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

// HTTPS options
const sslOptions = {
  key: fs.readFileSync('./localhost-key.pem'),
  cert: fs.readFileSync('./localhost.pem')
};

// Start HTTPS server
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`🔒 HTTPS Server running at https://localhost:${PORT}`);
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working', timestamp: new Date().toISOString() });
});
