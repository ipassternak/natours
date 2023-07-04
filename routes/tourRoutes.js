'use strict';

const express = require('express');
const {
  uploadTourImages,
  resizeTourImages,
  aliasHotTours,
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getToursStats,
  getMonthlyPlan,
  toursWithin,
  getDistances,
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router.route('/hot').get(aliasHotTours, getAllTours);
router.get('/stats', getToursStats);
router.get(
  '/monthly-plan/:year',
  protect,
  restrictTo('guide', 'lead-guide', 'admin'),
  getMonthlyPlan
);

router.get('/within/:distance/center/:coords/unit/:unit', toursWithin);
router.get('/distances/:coords/unit/:unit', getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('lead-guide', 'admin'), createTour);

router
  .route('/:id')
  .get(getTour)
  .all(protect, restrictTo('lead-guide', 'admin'))
  .patch(uploadTourImages, resizeTourImages, updateTour)
  .delete(deleteTour);

module.exports = router;
