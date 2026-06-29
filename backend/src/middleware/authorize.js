import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Role-based authorization. Usage: authorize('admin')
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient role permissions'));
    }
    next();
  };

// Ownership authorization. Loads a document via `loader(req)` and checks that the
// current user owns it (or is an admin). Attaches the loaded doc to req[attachAs].
// `ownerField` accepts dot-paths via getOwnerId for custom logic.
export const authorizeOwnership = ({ loader, getOwnerId, attachAs = 'resource', notFoundMsg }) =>
  asyncHandler(async (req, res, next) => {
    const doc = await loader(req);
    if (!doc) throw ApiError.notFound(notFoundMsg || 'Resource not found');

    const ownerId = getOwnerId ? getOwnerId(doc) : doc.owner;
    const isOwner = ownerId && ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) throw ApiError.forbidden('You do not have permission to modify this resource');

    req[attachAs] = doc;
    next();
  });
