/**
 * Centralized error handling middleware
 */
const errorMiddleware = (err, req, res, next) => {
  console.error('❌ Server Error Context:', err.stack || err.message || err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'An unexpected server error occurred.',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = errorMiddleware;
