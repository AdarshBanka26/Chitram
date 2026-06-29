import { verifyAccessToken } from '../utils/token.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Requires a valid access token. Attaches req.user.
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw ApiError.unauthorized('Missing or malformed Authorization header');

  const decoded = verifyAccessToken(token); // throws on invalid/expired -> handled centrally
  const user = await User.findById(decoded.sub);
  if (!user) throw ApiError.unauthorized('User no longer exists');

  req.user = user;
  next();
});

// Optional auth: attaches req.user if a valid token is present, otherwise continues.
// Used on public endpoints (e.g. viewing a work) where ownership/personalization
// matters only if the requester happens to be logged in.
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub);
    if (user) req.user = user;
  } catch {
    // ignore invalid token on optional routes
  }
  next();
});
