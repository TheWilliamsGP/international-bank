function maskAllButLast(value = '', visible = 4, maskChar = '*') {
  const s = String(value || '');
  if (!s) return '';
  const len = s.length;
  if (len <= visible) return s;
  const maskedLen = len - visible;
  return maskChar.repeat(maskedLen) + s.slice(-visible);
}

function maskFull(value = '', maskChar = '*') {
  return maskChar.repeat(String(value || '').length);
}

module.exports = { maskAllButLast, maskFull };
