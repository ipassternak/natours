'use strict';
const express = require('express');
const {
  getOverview,
  getTour,
  getLoginForm,
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
router.get('/login', confirmRegistation, getLoginForm);

module.exports = router;
