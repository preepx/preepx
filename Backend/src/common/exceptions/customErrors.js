const AppError = require('./AppError');

class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errors = null) {
    super(400, message, true);
    if (errors) {
      this.errors = errors;
    }
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, true);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, true);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message, true);
  }
}

module.exports = {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
};
