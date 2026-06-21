import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, _res, next) => next(new ApiError(404, `Route not found: ${req.originalUrl}`));

const formatDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
  const labels = {
    email: 'Email',
    nickname: 'Nickname',
    phone: 'Phone number'
  };
  return `${labels[field] || field} is already registered`;
};

export const errorHandler = (err, _req, res, _next) => {
  if (!err.isOperational) {
    console.error('[Server Error]', err);
  }

  if (err?.code === 11000) {
    err = new ApiError(409, formatDuplicateKeyError(err));
  }

  if (err?.name === 'ValidationError') {
    err = new ApiError(422, err.message);
  }

  const statusCode = err.statusCode || 500;
  const payload = {
    success: false,
    message: err.isOperational ? err.message : 'Something went wrong',
    details: err.details || undefined
  };
  if (process.env.NODE_ENV !== 'production') payload.stack = err.stack;
  res.status(statusCode).json(payload);
};
