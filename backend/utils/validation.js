// Input validation utilities with RegEx patterns
const validationPatterns = {
  // Name: letters, spaces, hyphens, apostrophes, 2-50 characters
  name: /^[A-Za-zÀ-ÿ\s\-']{2,50}$/,
  
  // Email: standard email format
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Password: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // SWIFT/BIC code: 8 or 11 alphanumeric characters
  swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
  
  // Account number: 8-17 digits
  accountNumber: /^\d{8,17}$/,
  
  // Card number: 13-19 digits
  cardNumber: /^\d{13,19}$/,
  
  // Card expiry: MM/YY format
  cardExpiry: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
  
  // CVV: 3 or 4 digits
  cardCvv: /^\d{3,4}$/,
  
  // Amount: positive numbers with optional decimal places
  amount: /^\d+(\.\d{1,2})?$/,
  
  // Bank name: letters, spaces, hyphens, apostrophes, 2-100 characters
  bankName: /^[A-Za-zÀ-ÿ0-9\s\-'&.]{2,100}$/
};

const validateInput = (pattern, value) => {
  return pattern.test(value);
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  // Basic sanitization to prevent XSS
  return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

module.exports = {
  validationPatterns,
  validateInput,
  sanitizeInput
};
