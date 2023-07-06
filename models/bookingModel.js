'use strict';

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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paid: {
    type: Boolean,
    default: true,
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

const Booking = model('Booking', bookingSchema);

module.exports = Booking;
