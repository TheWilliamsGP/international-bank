const express = require('express');
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { validationPatterns, validateInput, sanitizeInput } = require('../utils/validation');


const router = express.Router();

// Get all transactions (for admin)
router.get('/admin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const transactions = await Transaction.find().populate('userId', 'name email');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user transactions
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new transaction
router.post('/', auth, async (req, res) => {
  try {
    const {
      recipientName,
      recipientBank,
      swiftCode,
      accountNumber,
      amount,
      cardNumber,
      cardExpiry,
      cardCvv
    } = req.body;

    console.log('Creating transaction for user:', req.user.userId);

    // Validation
    if (!validateInput(validationPatterns.name, recipientName)) {
      return res.status(400).json({ error: 'Invalid recipient name' });
    }

    if (!validateInput(validationPatterns.bankName, recipientBank)) {
      return res.status(400).json({ error: 'Invalid bank name' });
    }

    if (!validateInput(validationPatterns.swiftCode, swiftCode)) {
      return res.status(400).json({ error: 'Invalid SWIFT code' });
    }

    if (!validateInput(validationPatterns.accountNumber, accountNumber)) {
      return res.status(400).json({ error: 'Invalid account number' });
    }

    if (!validateInput(validationPatterns.amount, amount.toString()) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!validateInput(validationPatterns.cardNumber, cardNumber)) {
      return res.status(400).json({ error: 'Invalid card number' });
    }

    if (!validateInput(validationPatterns.cardExpiry, cardExpiry)) {
      return res.status(400).json({ error: 'Invalid expiry date' });
    }

    if (!validateInput(validationPatterns.cardCvv, cardCvv)) {
      return res.status(400).json({ error: 'Invalid CVV' });
    }

    // Get user details
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create transaction
    const transaction = new Transaction({
      userId: req.user.userId,
      userName: user.name,
      recipientName: sanitizeInput(recipientName),
      recipientBank: sanitizeInput(recipientBank),
      swiftCode: sanitizeInput(swiftCode),
      accountNumber: sanitizeInput(accountNumber),
      amount: parseFloat(amount),
      cardNumber: sanitizeInput(cardNumber),
      cardExpiry: sanitizeInput(cardExpiry),
      cardCvv: sanitizeInput(cardCvv)
    });

    await transaction.save();
    console.log('Transaction created successfully:', transaction._id);

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update transaction status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name email');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    console.log('Transaction status updated:', transaction._id, 'to', status);

    res.json(transaction);
  } catch (error) {
    console.error('Transaction update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get transaction by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if user owns the transaction or is admin
    if (transaction.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;