'use strict';

class AppError extends Error {
  constructor(message = 'Internal Server Error', statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.status = statusCode < 500 ? 'fail' : 'error';
  }
}

module.exports = AppError;
