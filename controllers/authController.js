'use strict';

const crypto = require('node:crypto');
const { promisify } = require('node:util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const emailTemplates = require('../utils/email');

const AUTH_KEY = 'token';
const { NODE_ENV, JWT_SECRET, JWT_EXPIRES } = process.env;
const PROD_MODE = NODE_ENV === 'production';
const JWT_EXPIRES_MS = parseInt(JWT_EXPIRES) * 24 * 60 * 60 * 1000;

const signJWT = promisify(jwt.sign);
const verifyJWT = promisify(jwt.verify);

const signToken = (id) =>
  signJWT({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_MS,
  });

const sendToken = async (user, statusCode, res) => {
  const token = await signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + JWT_EXPIRES_MS),
    httpOnly: true,
  };
  if (PROD_MODE) cookieOptions.secure = true;
  res.cookie(AUTH_KEY, token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    data: {
      user,
    },
  });
};

const signup = catchAsync(async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });
  const url = `${req.protocol}://127.0.0.1:8000/account`;
  await emailTemplates.sendWelcome(user, url);
  await sendToken(user, 201, res);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new AppError('Email and password are required', 400);
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.verifyPassword(password, user.password)))
    throw new AppError('Invalid email or password', 401);
  await sendToken(user, 200, res);
});

const logout = catchAsync(async (req, res) => {
  res.cookie(AUTH_KEY, '', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

const protect = catchAsync(async (req, res, next) => {
  const token = req.cookies[AUTH_KEY];
  if (!token) throw new AppError('Invalid cookies', 401);
  const decoded = await verifyJWT(token, JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user)
    throw new AppError(
      'The user belonging to this token does no longer exist',
      401
    );
  const tokenIsValid = user.verifyJWTTimestamp(decoded.iat);
  if (!tokenIsValid)
    throw new AppError('Password was changed. Token is no longer valid', 401);
  req.user = user;
  next();
});

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      next(
        new AppError('You do not have permission to perform this action', 403)
      );
    next();
  };

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError('Email is required', 400);
  const user = await User.findOne({ email });
  if (!user) throw new AppError('Invalid email', 404);
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  try {
    await emailTemplates.sendResetPassword(user, resetURL);
    res.status(200).json({
      status: 'success',
      message: 'Token was sent to user email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('Sending email failed. Try to reset the password later');
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new AppError('Token is invalid or has expired', 400);
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  await sendToken(user, 200, res);
});

const changePassword = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const { currentPassword, password, passwordConfirm } = req.body;
  const passwordIsValid = await user.verifyPassword(
    currentPassword,
    user.password
  );
  if (!passwordIsValid) throw new AppError('Invalid password', 401);
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  await sendToken(user, 200, res);
});

const isLoggedIn = async (req, res, next) => {
  const token = req.cookies[AUTH_KEY];
  try {
    const decoded = await verifyJWT(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    const tokenIsValid = user.verifyJWTTimestamp(decoded.iat);
    if (tokenIsValid) res.locals.user = user;
  } finally {
    return next();
  }
};

module.exports = {
  signup,
  login,
  logout,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  changePassword,
  isLoggedIn,
};
