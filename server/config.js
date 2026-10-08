const crypto = require('node:crypto');

const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const adminPassword = String(process.env.ADMIN_PASSWORD || '');
const sessionSecret = String(process.env.SESSION_SECRET || '');
const portValue = process.env.PORT === undefined ? '3000' : process.env.PORT;
const port = Number(portValue);

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail) || adminEmail.length > 254) {
  throw new Error('Configure um ADMIN_EMAIL válido no arquivo .env.');
}
if (adminPassword.length < 12 || adminPassword.length > 128) {
  throw new Error('Configure um ADMIN_PASSWORD com 12 a 128 caracteres no arquivo .env.');
}
if (Buffer.byteLength(sessionSecret, 'utf8') < 32) {
  throw new Error('Configure um SESSION_SECRET com pelo menos 32 bytes no arquivo .env.');
}
if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
  throw new Error('Configure um PORT entre 1 e 65535 no arquivo .env.');
}

module.exports = {
  adminEmail,
  adminPasswordDigest: crypto.createHash('sha256').update(adminPassword, 'utf8').digest(),
  sessionSecret,
  port,
  isProduction: process.env.NODE_ENV === 'production',
};
