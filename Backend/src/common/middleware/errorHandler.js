const logger = require('../utils/logger');
const envConfig = require('../../config/env.config');
const AppError = require('../exceptions/AppError');
const { sendErrorResponse } = require('../utils/responseFormatter');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Convert non-AppError exceptions to AppError
  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal Server Error';
    error = new AppError(statusCode, message, false, err.stack);
  }

  const { statusCode, message } = error;

  // Log error using Winston
  if (envConfig.env === 'development') {
    logger.error(error);
  } else {
    // In production, only log non-operational (unhandled) errors deeply
    if (!error.isOperational) {
      logger.error(error);
    } else {
      logger.warn(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    }
  }

  // Hide stack trace and genericize message in production for 500 errors
  const responseMessage = (envConfig.env === 'production' && !error.isOperational) 
    ? 'Internal Server Error' 
    : message;

  const errors = error.errors || null; // e.g. Joi validation details

  sendErrorResponse(res, statusCode, responseMessage, errors);
};

module.exports = errorHandler;
