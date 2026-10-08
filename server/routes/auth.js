const crypto = require('node:crypto');
const express = require('express');
const config = require('../config');

const cookieName = 'essencial_by_dani_session';
const sessionDurationMs = 12 * 60 * 60 * 1000;
const loginWindowMs = 15 * 60 * 1000;
const maxLoginAttempts = 5;
const loginAttempts = new Map();

function digest(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest();
}

function hashSessionToken(token) {
  return crypto.createHmac('sha256', config.sessionSecret).update(token, 'utf8').digest('hex');
}

function getCookie(request) {
  const prefix = `${cookieName}=`;
  const cookie = String(request.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));
  const token = cookie ? cookie.slice(prefix.length) : '';
  return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}

function findSession(database, request) {
  const token = getCookie(request);
  if (!token) return null;
  return database.prepare('SELECT token_hash FROM auth_sessions WHERE token_hash = ? AND expires_at > ?')
    .get(hashSessionToken(token), new Date().toISOString()) || null;
}

function cookieOptions(maxAgeSeconds) {
  const parts = [`${cookieName}=`, 'Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${maxAgeSeconds}`];
  if (config.isProduction) parts.push('Secure');
  return parts;
}

function appendSessionCookie(response, token) {
  const parts = cookieOptions(sessionDurationMs / 1000);
  parts[0] = `${cookieName}=${token}`;
  response.setHeader('Set-Cookie', parts.join('; '));
}

function appendExpiredCookie(response) {
  const parts = cookieOptions(0);
  parts[0] = `${cookieName}=`;
  parts.push('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  response.setHeader('Set-Cookie', parts.join('; '));
}

function clearExpiredLoginAttempts(now) {
  if (loginAttempts.size < 1000) return;
  for (const [key, attempt] of loginAttempts) {
    if (now - attempt.startedAt >= loginWindowMs) loginAttempts.delete(key);
  }
}

function rateLimitLogin(request, response, next) {
  const now = Date.now();
  clearExpiredLoginAttempts(now);
  const key = request.ip || request.socket.remoteAddress || 'unknown';
  let attempt = loginAttempts.get(key);
  if (!attempt || now - attempt.startedAt >= loginWindowMs) {
    attempt = { startedAt: now, count: 0 };
    loginAttempts.set(key, attempt);
  }
  if (attempt.count >= maxLoginAttempts) {
    response.setHeader('Retry-After', String(Math.ceil((loginWindowMs - (now - attempt.startedAt)) / 1000)));
    return response.status(429).json({ erro: 'Muitas tentativas de acesso. Aguarde alguns minutos e tente novamente.' });
  }
  request.loginAttemptKey = key;
  next();
}

function rejectLogin(request, response) {
  const attempt = loginAttempts.get(request.loginAttemptKey);
  if (attempt) attempt.count += 1;
  return response.status(401).json({ erro: 'E-mail ou senha inválidos.' });
}

function createAuthRouter(database) {
  const router = express.Router();
  const createSession = database.transaction((tokenHash, expiresAt, now) => {
    database.prepare('DELETE FROM auth_sessions WHERE expires_at <= ?').run(now);
    database.prepare('INSERT INTO auth_sessions (token_hash, expires_at) VALUES (?, ?)').run(tokenHash, expiresAt);
  });

  router.get('/status', (request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    const authenticated = Boolean(findSession(database, request));
    response.json({
      authenticated,
      user: authenticated ? { email: config.adminEmail, role: 'Admin' } : null,
    });
  });

  router.post('/login', rateLimitLogin, (request, response) => {
    const body = request.body && typeof request.body === 'object' && !Array.isArray(request.body) ? request.body : {};
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const emailMatches = crypto.timingSafeEqual(digest(email), digest(config.adminEmail));
    const passwordMatches = crypto.timingSafeEqual(digest(password), config.adminPasswordDigest);

    if (!emailMatches || !passwordMatches) return rejectLogin(request, response);

    loginAttempts.delete(request.loginAttemptKey);
    const token = crypto.randomBytes(32).toString('base64url');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + sessionDurationMs).toISOString();
    createSession(hashSessionToken(token), expiresAt, now.toISOString());
    response.setHeader('Cache-Control', 'no-store');
    appendSessionCookie(response, token);
    response.json({ user: { email: config.adminEmail, role: 'Admin' } });
  });

  router.post('/logout', (request, response) => {
    const token = getCookie(request);
    if (token) database.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').run(hashSessionToken(token));
    appendExpiredCookie(response);
    response.status(204).end();
  });

  return router;
}

function requireAdmin(database) {
  return (request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    if (!findSession(database, request)) {
      return response.status(401).json({ erro: 'Sua sessão expirou. Entre novamente.' });
    }
    request.adminUser = { email: config.adminEmail, role: 'Admin' };
    next();
  };
}

module.exports = { createAuthRouter, requireAdmin };
