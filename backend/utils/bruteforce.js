// utils/bruteforce.js
const ExpressBrute = require('express-brute');

// DEV: In-memory store (resets on restart). Not for production.
const store = new ExpressBrute.MemoryStore();

// Standard protection (for login)
const bruteforce = new ExpressBrute(store, {
  freeRetries: 5,                // allowed failed attempts
  minWait: 15 * 60 * 1000,       // 15 minutes
  maxWait: 60 * 60 * 1000,       // up to 1 hour
  lifetime: 24 * 60 * 60         // seconds - lifetime of records (24 hours)
});

// Stricter protection (for register)
const bruteforceStrict = new ExpressBrute(store, {
  freeRetries: 3,
  minWait: 30 * 60 * 1000,       // 30 minutes
  maxWait: 24 * 60 * 60 * 1000,  // up to 24 hours
  lifetime: 24 * 60 * 60
});

module.exports = { bruteforce, bruteforceStrict };
