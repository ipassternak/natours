'use strict';

const crypto = require('node:crypto');
const { promisify } = require('node:util');
const ObjectId = require('mongoose').Types.ObjectId;
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const emailTemplates = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const { JWT_SECRET, JWT_EXPIRES } = process.env;
const JWT_EXPIRES_MS = parseInt(JWT_EXPIRES) * 24 * 60 * 60 * 1000;

const signJWT = promisify(jwt.sign);
const verifyJWT = promisify(jwt.verify);

const signToken = (id) =>
  signJWT({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_MS,
  });

const AUTH_KEY = 'token';  

const sendToken = async (req, res, user, statusCode) => {
  const token = await signToken(user._id);
  res.cookie(AUTH_KEY, token, {
    expires: new Date(Date.now() + JWT_EXPIRES_MS),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });
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
  const url = `${req.protocol}://${req.get('host')}/account`;
  await emailTemplates.sendWelcome(user, url);
  await sendToken(req, res, user, 201);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new AppError(
      'The body must contain email and password fields!', 
      400
    );
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.verifyPassword(password, user.password)))
    throw new AppError(
      'Invalid email or password. Check them out and try again!', 
      401
    );
  await sendToken(req, res, user, 200);
});

const logout = catchAsync(async (req, res) => {
  res.cookie(AUTH_KEY, '', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });
  res.status(200).json({
    status: 'success',
    message: 'You have been logged out successfully!',
  });
});

const protect = catchAsync(async (req, res, next) => {
  const token = req.cookies[AUTH_KEY];
  if (!token) throw new AppError('You are not logged in!', 401);
  const decoded = await verifyJWT(token, JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user)
    throw new AppError(
      'The user belonging to this token does no longer exist!',
      401
    );
  const tokenIsValid = user.verifyJWTTimestamp(decoded.iat);
  if (!tokenIsValid)
    throw new AppError(
      'The password has been changed. The token is no longer valid!', 
      401
    );
  req.user = user;
  next();
});

const PERMISSION_ERROR = new AppError(
  'You do not have permission to perform this action!',
  403
);

const restrictToRoles =
  (...roles) =>
  (req, res, next) => {
    if (roles.includes(req.user.role)) next();
    else next(PERMISSION_ERROR);
  };

const checkId = (registered, candidate) => {
  if (ObjectId.isValid(registered)) {
    return registered.equals(candidate);
  }
  return registered._id.equals(candidate);
};

const restrictToOwner = (Model, ownerField) =>
  catchAsync(async (req, res, next) => {
    if (req.user.role === 'admin') return next();
    const doc = await Model.findById(req.params.id);
    if (doc) {
      const value = doc[ownerField];
      const owners = Array.isArray(value) ? value : [value];
      const isOwner = owners.some((owner) => checkId(owner, req.user._id));
      if (isOwner) return next();
    }
    next(PERMISSION_ERROR);
  });

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) 
    throw new AppError('The body must contain email field!', 400);
  const user = await User.findOne({ email });
  if (!user) 
    throw new AppError('Invalid email. Check it out and try again!', 404);
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  try {
    await emailTemplates.sendResetPassword(user, resetURL);
    res.status(200).json({
      status: 'success',
      message: 'The token has been sent to your email address!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError(
      'Failed to send email. Try to reset your password later!'
    );
  }
});

const resetPassword = catchAsync(async (req, res) => {
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new AppError('The token is invalid or has expired!', 400);
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  await sendToken(req, res, user, 200);
});

const changePassword = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const { currentPassword, password, passwordConfirm } = req.body;
  const passwordIsValid = await user.verifyPassword(
    currentPassword,
    user.password
  );
  if (!passwordIsValid) 
    throw new AppError('Invalid password. Check it out and try again!', 401);
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  await sendToken(req, res, user, 200);
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
  restrictToRoles,
  restrictToOwner,
  forgotPassword,
  resetPassword,
  changePassword,
  isLoggedIn,
};
