const express = require('express');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const router = express.Router();

// In-memory brute-force protection
const failedAttempts = new Map(); // key: username|ip, value: { count, lockedUntil }

const LOGIN_LIMIT_WINDOW_MS = 60 * 1000; // 1 dakika
const LOGIN_LIMIT_MAX = 10; // 1 dakikada max 10 istek/IP
const MAX_FAILED_ATTEMPTS = 5; // yanlış deneme sınırı
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 dakika kilit

const loginRateLimiter = rateLimit({
  windowMs: LOGIN_LIMIT_WINDOW_MS,
  max: LOGIN_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

function getAttemptKey(username, ip) {
  return `${username || 'unknown'}|${ip || 'unknown'}`;
}

function isLocked(username, ip) {
  const key = getAttemptKey(username, ip);
  const entry = failedAttempts.get(key);
  if (!entry) return false;
  if (entry.lockedUntil && entry.lockedUntil > Date.now()) {
    return true;
  }
  if (entry.lockedUntil && entry.lockedUntil <= Date.now()) {
    failedAttempts.delete(key);
  }
  return false;
}

function registerFailure(username, ip) {
  const key = getAttemptKey(username, ip);
  const now = Date.now();
  const entry = failedAttempts.get(key) || { count: 0, lockedUntil: null };
  entry.count += 1;
  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    entry.lockedUntil = now + LOCK_TIME_MS;
  }
  failedAttempts.set(key, entry);
}

function resetFailures(username, ip) {
  const key = getAttemptKey(username, ip);
  failedAttempts.delete(key);
}

router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur' });
    }

    const ip = req.ip;

    if (isLocked(username, ip)) {
      return res.status(429).json({
        error: 'Çok fazla hatalı giriş denemesi. Lütfen daha sonra tekrar deneyin.'
      });
    }

    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!expectedUsername || !expectedPassword || !jwtSecret) {
      console.error('Auth env variables are not fully configured');
      return res.status(500).json({ error: 'Authentication is not configured' });
    }

    const isValid = username === expectedUsername && password === expectedPassword;

    if (!isValid) {
      registerFailure(username, ip);
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }

    resetFailures(username, ip);

    const token = jwt.sign(
      {
        username,
        role: 'admin'
      },
      jwtSecret,
      {
        expiresIn: '8h'
      }
    );

    return res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Giriş sırasında bir hata oluştu' });
  }
});

router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'Authentication is not configured' });
    }
    const payload = jwt.verify(token, jwtSecret);
    return res.json({ user: payload });
  } catch (error) {
    console.error('Me error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
