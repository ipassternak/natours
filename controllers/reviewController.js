'use strict';

const Review = require('../models/reviewModel');
const ControllerFactory = require('./controllerFactory');
const { restrictToOwner } = require('./authController');

const setReferenceIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  req.body.user = req.user._id;
  next();
};

const checkReviewOwnership = restrictToOwner(Review, 'user');

const reviewController = new ControllerFactory(Review);

const getAllReviews = reviewController.getAll();
const getReview = reviewController.getOne();
const createReview = reviewController.createOne();
const updateReview = reviewController.updateOne();
const deleteReview = reviewController.deleteOne();

module.exports = {
  setReferenceIds,
  checkReviewOwnership,
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
};
