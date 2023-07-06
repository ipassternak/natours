'use strict';

const Review = require('../models/reviewModel');
const ControllerFactory = require('./controllerFactory');
const { restrictToOwner } = require('./authController');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const setReferenceIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  req.body.user = req.user._id;
  next();
};

const checkReviewOwnership = restrictToOwner(Review, 'user');

const reviewController = new ControllerFactory(Review);

const getAllReviews = reviewController.getAll();
const getReview = reviewController.getOne();
const updateReview = reviewController.updateOne();
const deleteReview = reviewController.deleteOne();

const createReview = catchAsync(async (req, res) => {
  const user = req.user._id;
  const { tour, rating, content } = req.body;
  const booking = await Booking.findOne({ tour, user });
  if (!booking) 
    throw new AppError('You cannot review non booked tour!', 400);
  const { startDates, duration } = booking.tour;
  const tourHasNotEnded = startDates.some((date) => 
    date.getTime() > Date.now() + duration * 24 * 60 * 60 * 1000
  );
  if (tourHasNotEnded) 
    throw new AppError('You cannot review this tour until it ends!', 400);
  const review = await Review.create({ user, tour, rating, content });
  res.status(201).json({
    status: 'success',
    review,
  })  
});

module.exports = {
  setReferenceIds,
  checkReviewOwnership,
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
};
