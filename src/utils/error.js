// src/utils/error.js
export function parseServerError(err) {
  if (!err) return 'Unknown error';

  // If it's already a string
  if (typeof err === 'string') return err;

  // axios error with response
  const res = err?.response?.data;
  if (res) {
    // If backend returned a simple string
    if (typeof res === 'string') return res;

    // Direct error string field
    if (res.error && typeof res.error === 'string') return res.error;

    // Nested error object like { error: { text, nextValidRequestDate } }
    if (res.error && typeof res.error === 'object') {
      const nested = res.error;
      if (nested.text) {
        const when = nested.nextValidRequestDate ? ` Try again after ${new Date(nested.nextValidRequestDate).toLocaleString()}.` : '';
        return `${nested.text}${when}`.trim();
      }
    }

    // Common patterns
    if (res.message && typeof res.message === 'string') return res.message;

    // express-validator style: { errors: [ { msg: '...' }, ... ] }
    if (Array.isArray(res.errors)) {
      return res.errors.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
    }

    // Some APIs return { errors: { field: 'message' } }
    if (res.errors && typeof res.errors === 'object') {
      try {
        const msgs = Object.values(res.errors).map(v => (typeof v === 'string' ? v : JSON.stringify(v)));
        if (msgs.length) return msgs.join(', ');
      } catch (_) { /* fallthrough */ }
    }

    // Fallback: stringify the response object (safe)
    try {
      const s = JSON.stringify(res);
      return s.length > 0 ? s : 'An error occurred';
    } catch (e) {
      return 'An error occurred';
    }
  }

  // axios error without response
  if (err.message) return err.message;

  // last resort
  try {
    return String(err);
  } catch (e) {
    return 'An unknown error occurred';
  }
}
