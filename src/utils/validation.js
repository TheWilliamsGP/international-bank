// Input validation utilities with RegEx patterns
export const validationPatterns = {
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

export const validateInput = (pattern, value) => {
  return pattern.test(value);
};

export const sanitizeInput = (input) => {
  // Basic sanitization to prevent XSS
  return input.toString().replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

export const getValidationError = (field, value) => {
  switch (field) {
    case 'name':
      if (!value) return 'Name is required';
      if (!validateInput(validationPatterns.name, value)) 
        return 'Name should contain only letters, spaces, hyphens, or apostrophes (2-50 characters)';
      break;
      
    case 'email':
      if (!value) return 'Email is required';
      if (!validateInput(validationPatterns.email, value)) 
        return 'Please enter a valid email address';
      break;
      
    case 'password':
      if (!value) return 'Password is required';
      if (!validateInput(validationPatterns.password, value))
        return 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
      break;
      
    case 'swiftCode':
      if (!value) return 'SWIFT code is required';
      if (!validateInput(validationPatterns.swiftCode, value))
        return 'Please enter a valid SWIFT/BIC code (8 or 11 characters)';
      break;
      
    case 'accountNumber':
      if (!value) return 'Account number is required';
      if (!validateInput(validationPatterns.accountNumber, value))
        return 'Account number must be 8-17 digits';
      break;
      
    case 'cardNumber':
      if (!value) return 'Card number is required';
      if (!validateInput(validationPatterns.cardNumber, value))
        return 'Please enter a valid card number (13-19 digits)';
      break;
      
    case 'cardExpiry':
      if (!value) return 'Expiry date is required';
      if (!validateInput(validationPatterns.cardExpiry, value))
        return 'Please enter expiry date in MM/YY format';
      break;
      
    case 'cardCvv':
      if (!value) return 'CVV is required';
      if (!validateInput(validationPatterns.cardCvv, value))
        return 'CVV must be 3 or 4 digits';
      break;
      
    case 'amount':
      if (!value) return 'Amount is required';
      if (!validateInput(validationPatterns.amount, value) || parseFloat(value) <= 0)
        return 'Please enter a valid positive amount';
      break;
      
    case 'recipientName':
      if (!value) return 'Recipient name is required';
      if (!validateInput(validationPatterns.name, value))
        return 'Recipient name should contain only letters, spaces, hyphens, or apostrophes';
      break;
      
    case 'recipientBank':
      if (!value) return 'Bank name is required';
      if (!validateInput(validationPatterns.bankName, value))
        return 'Please enter a valid bank name';
      break;
      
    default:
      return '';
  }
  return '';
};