'use strict';

const AppError = require('../utils/AppError');

const DEV_MODE = process.env.NODE_ENV === 'dev';

const pageErrorMessages = {
  401: 'You are not logged in!',
  403: 'You do not have access to this page!',
  404: 'Page not found!',
};

const sendGenericError = (err, req, res) => {
  const { statusCode, status, message } = err;
  if (req.originalUrl.startsWith('/api')) {
    res.status(statusCode).json({
      status,
      message,
    });
  } else {
    res.status(statusCode).render('error', {
      title: `${statusCode}`,
      message: pageErrorMessages[statusCode],
    });
  }
};

const mongoErrorCodeHandlers = {
  11000: (err) => {
    const duplicates = err.keyValue;
    const fields = Object.keys(duplicates);
    const { length } = fields;
    const noun = length === 1 ? 'value' : 'values';
    const adj = length === 1 ? 'another' : 'others';
    return `Duplicated field ${noun}: ${fields.join(', ')}. Use ${adj} ${noun}`;
  },
};

const handleAppError = (err) => err;

const handleMongoErrors = (err) => {
  const handler = mongoErrorCodeHandlers[err.code];
  const message = handler ? handler(err) : 'Bad request';
  return new AppError(message, 400);
};

const hanldeCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(({ message }) => message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token', 401);

const handleJWTExpired = () => new AppError('Token has expired', 401);

const handleUnexpectedError = (err) => {
  if (!DEV_MODE) console.error(err);
  return new AppError();
};

const errorHandlers = {
  AppError: handleAppError,
  MongoServerError: handleMongoErrors,
  CastError: hanldeCastError,
  ValidationError: handleValidationError,
  JsonWebTokenError: handleJWTError,
  TokenExpiredError: handleJWTExpired,
};

const errorController = (err, req, res, next) => {
  const handler = errorHandlers[err.name] || handleUnexpectedError;
  const genericError = handler(err);
  if (DEV_MODE) {
    const { statusCode, status, message } = genericError;
    console.dir({
      err,
      handler,
      genericError: { statusCode, status, message },
    });
  }
  sendGenericError(genericError, req, res);
};

module.exports = errorController;
