'use strict';
const express = require('express');
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  getAlert,
} = require('../controllers/viewController');
const { protect, isLoggedIn } = require('../controllers/authController');
const {
  createBookingCheckout,
  getBookedTours,
} = require('../controllers/bookingController');

const router = express.Router();

router.use(getAlert);

router.get('/account', protect, getAccount);
router.get('/bookings', protect, getBookedTours);

router.use(isLoggedIn);

router.get('/', createBookingCheckout, getOverview);
router.get('/tour/:slug', getTour);
router.get('/login', getLoginForm);

module.exports = router;
