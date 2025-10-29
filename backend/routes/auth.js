// const express = require('express');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const { validationPatterns, validateInput, sanitizeInput } = require('../utils/validation');


// const router = express.Router();

// // Generate JWT Token with validation
// const generateToken = (userId) => {
//   if (!process.env.JWT_SECRET) {
//     console.error('JWT_SECRET is not configured');
//     throw new Error('Server configuration error: JWT secret missing');
//   }
//   return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
// };

// // Register
// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     console.log('Registration attempt:', { name, email });
//     console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);

//     // Input validation
//     if (!validateInput(validationPatterns.name, name)) {
//       return res.status(400).json({ error: 'Invalid name format' });
//     }

//     if (!validateInput(validationPatterns.email, email)) {
//       return res.status(400).json({ error: 'Invalid email format' });
//     }

//     if (!validateInput(validationPatterns.password, password)) {
//       return res.status(400).json({ error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     console.log('Existing user check:', existingUser ? 'Exists' : 'Does not exist');
    
//     if (existingUser) {
//       return res.status(400).json({ error: 'User already exists with this email' });
//     }

//     // Create new user
//     const user = new User({
//       name: sanitizeInput(name),
//       email: sanitizeInput(email),
//       password: sanitizeInput(password)
//     });

//     await user.save();
//     console.log('User saved successfully:', user.email);

//     // Generate token
//     const token = generateToken(user._id);

//     res.status(201).json({
//       message: 'User created successfully',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Login
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     console.log('Login attempt for email:', email);
//     console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
    
//     if (!process.env.JWT_SECRET) {
//       return res.status(500).json({ error: 'Server configuration error: JWT secret missing' });
//     }

//     // Find user
//     const user = await User.findOne({ email });
//     console.log('User found:', user ? 'Yes' : 'No');
    
//     if (!user) {
//       console.log('No user found with email:', email);
//       return res.status(400).json({ error: 'Invalid email or password' });
//     }

//     // Check password
//     const isPasswordValid = await user.comparePassword(password);
//     console.log('Password valid:', isPasswordValid);
    
//     if (!isPasswordValid) {
//       console.log('Invalid password for user:', email);
//       return res.status(400).json({ error: 'Invalid email or password' });
//     }

//     // Generate token
//     console.log('Generating token...');
//     const token = generateToken(user._id);
//     console.log('Token generated successfully');

//     console.log('Login successful for user:', email);
    
//     res.json({
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     console.error('Login error:', error.message);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Verify token
// router.get('/verify', async (req, res) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
    
//     if (!token) {
//       return res.status(401).json({ error: 'No token provided' });
//     }

//     if (!process.env.JWT_SECRET) {
//       return res.status(500).json({ error: 'Server configuration error: JWT secret missing' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId).select('-password');
    
//     if (!user) {
//       return res.status(401).json({ error: 'Token is not valid' });
//     }

//     res.json({ valid: true, user });
//   } catch (error) {
//     res.status(401).json({ error: 'Token is not valid' });
//   }
// });

// // Get all users (admin only)
// router.get('/users', async (req, res) => {
//   try {
//     const users = await User.find().select('-password');
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Add a debug endpoint to check JWT_SECRET status
// router.get('/debug/jwt-secret', (req, res) => {
//   res.json({
//     jwtSecretExists: !!process.env.JWT_SECRET,
//     jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
//     timestamp: new Date().toISOString()
//   });
// });

// module.exports = router;


const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sanitizeInput } = require('../utils/validation');
const jwt = require('jsonwebtoken');
const { bruteforce, bruteforceStrict } = require('../utils/bruteforce');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not configured');
    throw new Error('Server configuration error: JWT secret missing');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// REGISTER route with express-validator + stricter brute protection
router.post(
  '/register',
  bruteforceStrict.prevent, // throttle registration attempts
  [
    body('name').notEmpty().trim().escape().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[a-z]/)
      .withMessage('Password must contain a lowercase letter')
      .matches(/[A-Z]/)
      .withMessage('Password must contain an uppercase letter')
      .matches(/\d/)
      .withMessage('Password must contain a number')
      .matches(/[\W_]/)
      .withMessage('Password must contain a special character')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;
      console.log('Registration attempt:', { name, email });

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Create new user
      const user = new User({
        name: sanitizeInput(name),
        email: sanitizeInput(email),
        password: sanitizeInput(password)
      });

      await user.save();
      console.log('User saved successfully:', user.email);

      // Generate JWT token
      const token = generateToken(user._id);

      // Optionally reset brute data for this IP after successful register
      if (req.brute) {
        req.brute.reset(() => {});
      }

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// LOGIN route with brute protection
router.post(
  '/login',
  bruteforce.prevent, // throttle login attempts
  [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      // validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      console.log('Login attempt for email:', email);

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        // do not reveal whether email exists
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      // success -> reset brute counters for this key (IP)
      if (req.brute) {
        req.brute.reset(() => {});
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
