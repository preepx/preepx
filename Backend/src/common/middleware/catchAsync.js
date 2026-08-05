/**
 * Wrapper for async route handlers to catch exceptions and pass them to the global errorHandler middleware.
 * Eliminates the need for try-catch blocks in controllers.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = catchAsync;
