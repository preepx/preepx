/**
 * Standardize successful API responses
 * @param {Response} res Express response object
 * @param {number} statusCode HTTP status code
 * @param {string} message Success message
 * @param {object} data Payload data
 */
const sendSuccessResponse = (res, statusCode, message, data = {}) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standardize error API responses (handled mostly by errorHandler middleware)
 * @param {Response} res Express response object
 * @param {number} statusCode HTTP status code
 * @param {string} message Error message
 * @param {object} errors Detailed error object (e.g. validation errors)
 */
const sendErrorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  res.status(statusCode).json(response);
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
};
