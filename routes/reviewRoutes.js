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
const { protect, restrictToRoles } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(queryTourId, getAllReviews)
  .post(restrictToRoles('user'), setReferenceIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .all(restrictToRoles('user', 'admin'), checkReviewOwnership)
  .patch(updateReview)
  .delete(deleteReview);

module.exports = router;
