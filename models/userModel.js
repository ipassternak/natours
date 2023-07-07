'use strict';

const crypto = require('node:crypto');
const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const { isEmail } = require('validator');

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'The body must contain name field!'],
    trim: true,
    maxlength: [20, 'The name should not contain more than 20 characters1'],
    minlength: [1, 'The name should not contain less than 1 characters!'],
  },
  email: {
    type: String,
    required: [true, 'The body must contain email field!'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Invalid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'guide', 'lead-guide', 'admin'],
      message: 'Invalid role',
    },
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'The body must contain password field!'],
    select: false,
    maxlength: [20, 'The password should not contain more than 20 characters!'],
    minlength: [8, 'The password should not contain less than 10 characters!'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'The body must contain passwordConfirm field!'],
    validate: {
      validator: function (confirmation) {
        return confirmation === this.password;
      },
      message: 'Invalid password confirmation!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  disabledAt: {
    type: Date,
    default: null,
    expires: '1d',
    select: false,
  },
  accountConfirmToken: String,
});

const PASSWORD_SALT_ROUNDS = parseInt(process.env.PASSWORD_SALT_ROUNDS);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const { password } = this;
    try {
      const hash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
      this.password = hash;
      this.passwordConfirm = undefined;
    } catch (err) {
      next(err);
    }
  }
  next();
});

userSchema.pre('save', function (next) {
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  next();
});

userSchema.methods.createConfirmToken = async function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.accountConfirmToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.disabledAt = Date.now();  
  await this.save({ validateBeforeSave: false });
  return token;
};

userSchema.pre(/^find/, function (next) {
  this.find({
    $or: [
      { disabledAt: null },
      { accountConfirmToken: { $exists: true } }
    ]
  });
  next();
});

userSchema.methods.verifyPassword = function (candidate, hash) {
  return bcrypt.compare(candidate, hash);
};

userSchema.methods.verifyJWTTimestamp = function (timestamp) {
  const { passwordChangedAt } = this;
  if (!passwordChangedAt) return true;
  const changedTimestamp = passwordChangedAt.getTime() / 1000;
  return changedTimestamp < timestamp;
};

const PASSWORD_EXPIRES_IN = 
  parseInt(process.env.PASSWORD_EXPIRES_IN) * 60 * 1000;

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.passwordResetExpires = Date.now() + PASSWORD_EXPIRES_IN ;
  return token;
};

const configurableFields = ['name', 'email'];

userSchema.methods.filterUpdateBody = function (body) {
  const filteredBody = {};
  const keys = Object.keys(body).filter((key) =>
    configurableFields.includes(key)
  );
  for (const key of keys) {
    filteredBody[key] = body[key];
  }
  return filteredBody;
};

const User = model('User', userSchema);

module.exports = User;
