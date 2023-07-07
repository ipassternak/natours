'use strict';
const express = require('express');
const {
  getOverview,
  getTour,
  getSignupForm,
  getLoginForm,
  getForgotPassordForm,
  getResetPassordForm,
  getAccount,
  getAlert,
} = require('../controllers/viewController');
const { confirmRegistation, protect, isLoggedIn } = require('../controllers/authController');
const {
  createBookingCheckout,
  getAccountBookings,
} = require('../controllers/bookingController');

const router = express.Router();

router.use(getAlert);

router.get('/account', protect, getAccount);
router.get('/bookings', protect, getAccountBookings);

router.use(isLoggedIn);

router.get('/', createBookingCheckout, getOverview);
router.get('/tour/:slug', getTour);
router.get('/signup', getSignupForm);
router.get('/login', confirmRegistation, getLoginForm);
router.get('/forgot-password', getForgotPassordForm);
router.get('/reset-password/:resetToken', getResetPassordForm);

module.exports = router;
