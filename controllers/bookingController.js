'use strict';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const ControllerFactory = require('./controllerFactory');
const catchAsync = require('../utils/catchAsync');

const bookingController = new ControllerFactory(Booking);

const getAllBookings = bookingController.getAll();
const getBooking = bookingController.getOne();
const createBooking = bookingController.createOne();
const updateBooking = bookingController.updateOne();
const deleteBooking = bookingController.deleteOne();

const getCheckoutSession = catchAsync(async (req, res) => {
  const tour = await Tour.findById(req.params.tourId);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user._id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100,
          currency: 'usd',
        },
        quantity: 1,
      },
    ],
  });
  res.status(200).json({
    status: 'success',
    session,
  });
});

const createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour || !user || !price) return next();
  await Booking.create({ tour, user, price });
  res.redirect(`${req.protocol}://${req.get('host')}/bookings?alert=booking`);
});

const getBookedTours = catchAsync(async (req, res) => {
  const { user } = req;
  const bookings = await Booking.find({ user: user._id });
  const tourIDs = bookings.map((booking) => booking.tour._id);
  const tours = await Tour.find({
    _id: { $in: tourIDs },
  });
  res.status(200).render('overview', {
    title: 'Bookings',
    user,
    tours,
  });
});

module.exports = {
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getCheckoutSession,
  createBookingCheckout,
  getBookedTours,
};
