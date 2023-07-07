'use strict';

const crypto = require('node:crypto');
const { Schema, model } = require('mongoose');

const bookingSchema = new Schema({
  tour: {
    type: Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'The body must contain tour field!'],
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: [true, 'The body must contain user field!'],
  },
  price: {
    type: Number,
    required: [true, 'The body must contain price field!'],
  },
  date: {
    type: Date,
    required: [true, 'The body must contain date field!'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  successPaidToken: {
    type: String,
    select: false,
  },
  cancelPaidToken: {
    type: String,
    select: false,
  },
});

bookingSchema.index({ tour: 1, user: 1 }, { unique: true });

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name startDates duration',
  });
  next();
});

bookingSchema.methods.generatePaidTokens = async function () {
  const tokens = [];
  for (let i = 0; i < 2; i++) {
    const token = crypto.randomBytes(32).toString('hex');
    const encrypted = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    this[!i ? 'successPaidToken' : 'cancelPaidToken'] = encrypted; 
    tokens.push(token);
  }
  await this.save({ validateBeforeSave: false });
  return tokens;
};

const Booking = model('Booking', bookingSchema);

module.exports = Booking;
