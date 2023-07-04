'use strict';

const crypto = require('node:crypto');
const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const { isEmail } = require('validator');

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [20, 'The name should not contain more than 20 characters'],
    minlength: [1, 'The name should not contain less than 1 characters'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Invalid email'],
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
    required: true,
    select: false,
    maxlength: [20, 'The password should not contain more than 20 characters'],
    minlength: [8, 'The password should not contain less than 10 characters'],
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function (confirmation) {
        return confirmation === this.password;
      },
      message: 'Invalid password confirmation',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
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

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
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

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
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
