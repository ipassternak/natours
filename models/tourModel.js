'use strict';

const { Schema, model } = require('mongoose');
const slugify = require('slugify');

const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [40, 'The name should not contain more than 40 characters'],
      minlength: [10, 'The name should not contain less than 10 characters'],
    },
    duration: {
      type: Number,
      required: true,
    },
    maxGroupSize: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Invalid difficulty',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      max: [5, 'The value of ratings should be in range: [0:5]'],
      min: [0, 'The value of ratings should be in range: [0:5]'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (newPrice) {
          return newPrice < this.price && newPrice > 0;
        },
        message: 'Invalid discount: {VALUE} should be less than price',
      },
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: true,
    },
    images: [String],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: Schema.ObjectId,
        ref: 'User',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    startDates: [Date],
    slug: {
      type: String,
      default: function () {
        return slugify(this.name, { lower: true });
      },
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

tourSchema.index({ startLocation: '2dsphere' });
tourSchema.index({ slug: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

const Tour = model('Tour', tourSchema);

module.exports = Tour;
