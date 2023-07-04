'use strict';

const { Schema, model } = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      maxlength: [
        300,
        'The maximum allowed number of characters has been exceeded',
      ],
      minlength: [1, 'Review content can not be empty'],
    },
    rating: {
      type: Number,
      required: true,
      max: 5,
      min: 1,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: Schema.ObjectId,
      ref: 'Tour',
      required: true,
    },
    user: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tour) {
  const stats = await this.aggregate([
    {
      $match: { tour },
    },
    {
      $group: {
        _id: '$tour',
        ratingsQuantity: { $sum: 1 },
        ratingsAverage: { $avg: '$rating' },
      },
    },
  ]);
  const [{ ratingsAverage = 0, ratingsQuantity = 0 } = {}] = stats;
  await Tour.findByIdAndUpdate(tour, { ratingsAverage, ratingsQuantity });
};

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.post('save', async function (doc, next) {
  await this.constructor.calcAverageRatings(doc.tour);
  next();
});

reviewSchema.pre(/^findOneAnd(?:Delete|Update)$/, async function (next) {
  const { tour } = await this.model.findOne(this.getQuery());
  this.tour = tour;
  next();
});

reviewSchema.post(/^findOneAnd(?:Delete|Update)$/, async function () {
  this.model.calcAverageRatings(this.tour);
});

const Review = model('Review', reviewSchema);

module.exports = Review;
