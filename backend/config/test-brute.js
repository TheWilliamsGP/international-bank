// utils/bruteforce.js
const ExpressBrute = require('express-brute');

// DEV: In-memory store (resets on restart). Not for production.
const store = new ExpressBrute.MemoryStore();

// Custom fail callback — produce a friendly error shape
const failCallback = function (req, res, next, nextValidRequestDate) {
  // nextValidRequestDate may be undefined; format nicely if present
  const when = nextValidRequestDate ? ` Try again after ${new Date(nextValidRequestDate).toLocaleString()}.` : '';
  const message = `Too many requests in this time frame.${when}`;

  // Return a single error field (string) that frontend can render safely
  res.status(429).json({ error: message });
};

// Standard protection (for login)
const bruteforce = new ExpressBrute(store, {
  freeRetries: 5,
  minWait: 5 * 60 * 1000,
  maxWait: 60 * 60 * 1000,
  lifetime: 24 * 60 * 60,
  failCallback // <-- use our custom response
});

// Stricter protection (for register)
const bruteforceStrict = new ExpressBrute(store, {
  freeRetries: 3,
  minWait: 10 * 60 * 1000,
  maxWait: 24 * 60 * 60 * 1000,
  lifetime: 24 * 60 * 60,
  failCallback 
});

module.exports = { bruteforce, bruteforceStrict };
