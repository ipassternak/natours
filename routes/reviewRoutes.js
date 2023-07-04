'use strict';

const express = require('express');

const {
  queryTourId,
  setReferenceIds,
  checkReviewOwnership,
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(queryTourId, getAllReviews)
  .post(restrictTo('user'), setReferenceIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .all(restrictTo('user', 'admin'), checkReviewOwnership)
  .patch(updateReview)
  .delete(deleteReview);

module.exports = router;
