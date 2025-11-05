const mongoose = require('mongoose');
const crypto = require('crypto');

// Replace this with a strong secret in your .env
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // 32 chars
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  const [ivHex, encrypted] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Masking helper
function maskAllButLast(value, visible = 4, maskChar = '*') {
  const s = String(value);
  if (!s) return '';
  const len = s.length;
  if (len <= visible) return s;
  return maskChar.repeat(len - visible) + s.slice(-visible);
}

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  recipientName: { type: String, required: true, trim: true },
  recipientBank: { type: String, required: true, trim: true },
  swiftCode: { type: String, required: true, match: [/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Invalid SWIFT'] },
  accountNumber: { type: String, required: true, match: [/^\d{8,17}$/, 'Account number must be 8-17 digits'] },
  amount: { type: Number, required: true, min: 0.01 },
  cardNumber: { type: String, required: true },
  cardExpiry: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Encrypt account/card numbers before saving
transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.isModified('accountNumber')) {
    this.accountNumber = encrypt(this.accountNumber);
  }
  if (this.isModified('cardNumber')) {
    this.cardNumber = encrypt(this.cardNumber);
  }
  next();
});

// Auto-populate user info
transactionSchema.pre(/^find/, function(next) {
  this.populate('userId', 'name email');
  next();
});

// Mask encrypted fields in JSON response
transactionSchema.methods.toJSON = function() {
  const obj = this.toObject();
  if (obj.accountNumber) {
    try { obj.accountNumber = maskAllButLast(decrypt(obj.accountNumber)); } catch {}
  }
  if (obj.cardNumber) {
    try { obj.cardNumber = maskAllButLast(decrypt(obj.cardNumber)); } catch {}
  }
  // Never include CVV
  delete obj.cardCvv;
  return obj;
};

module.exports = mongoose.model('Transaction', transactionSchema);
