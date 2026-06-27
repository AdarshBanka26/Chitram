import crypto from 'crypto';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { issueTokens, verifyRefreshToken } from '../utils/token.js';

// Refresh tokens are stored hashed so a DB leak can't be used to mint sessions.
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const sendAuth = async (res, user, statusCode = 200) => {
  const { accessToken, refreshToken } = issueTokens(user);
  user.refreshTokens.push(hashToken(refreshToken));
  // Keep the list bounded (max 5 active sessions).
  if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5);
  await user.save();
  res.status(statusCode).json({ success: true, user, accessToken, refreshToken });
};

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, username, email, password, preferences } = req.body;
  if (!name || !username || !email || !password) {
    throw ApiError.badRequest('name, username, email and password are required');
  }

  const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
  if (exists) throw ApiError.conflict('Email or username already in use');

  const created = await User.create({ name, username, email, password, preferences });
  const user = await User.findById(created._id).select('+refreshTokens');

  await sendAuth(res, user, 201);
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { identifier, email, username, password } = req.body;
  const loginId = (identifier || email || username || '').toLowerCase();
  if (!loginId || !password) throw ApiError.badRequest('identifier (email or username) and password are required');

  const user = await User.findOne({ $or: [{ email: loginId }, { username: loginId }] }).select(
    '+password +refreshTokens'
  );
  if (!user || !(await user.matchPassword(password))) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  await sendAuth(res, user);
});

// POST /api/auth/refresh  { refreshToken }
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw ApiError.badRequest('refreshToken is required');

  const decoded = verifyRefreshToken(refreshToken); // throws if invalid/expired
  const user = await User.findById(decoded.sub).select('+refreshTokens');
  if (!user) throw ApiError.unauthorized('User no longer exists');

  const hashed = hashToken(refreshToken);
  if (!user.refreshTokens.includes(hashed)) {
    throw ApiError.unauthorized('Refresh token has been revoked');
  }

  // Rotate: remove the used token, issue a fresh pair.
  user.refreshTokens = user.refreshTokens.filter((t) => t !== hashed);
  await sendAuth(res, user);
});

// POST /api/auth/logout  { refreshToken }
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    const decoded = (() => {
      try {
        return verifyRefreshToken(refreshToken);
      } catch {
        return null;
      }
    })();
    if (decoded) {
      const user = await User.findById(decoded.sub).select('+refreshTokens');
      if (user) {
        user.refreshTokens = user.refreshTokens.filter((t) => t !== hashToken(refreshToken));
        await user.save();
      }
    }
  }
  res.json({ success: true, message: 'Logged out' });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
