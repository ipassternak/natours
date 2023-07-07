'use strict';

const express = require('express');
const {
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getCheckoutSession,
  createBookingCheckout,
} = require('../controllers/bookingController');
const { protect, restrictToRoles } = require('../controllers/authController');
const queryNestedId = require('../utils/queryNestedId');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/checkout-session/:tourId/:startDate', getCheckoutSession);

router.get('/webhook-checkout/:id/:paidToken', createBookingCheckout);

router.use(restrictToRoles('admin'));

router.route('/').get(queryNestedId('tourId'), getAllBookings).post(createBooking);
router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
