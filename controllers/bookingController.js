'use strict';

const crypto = require('node:crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const ControllerFactory = require('./controllerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const bookingController = new ControllerFactory(Booking);

const getAllBookings = bookingController.getAll();
const getBooking = bookingController.getOne();
const createBooking = bookingController.createOne();
const updateBooking = bookingController.updateOne();
const deleteBooking = bookingController.deleteOne();

const checkDisiredDate = async (tour, disiredDate) => {
  const date = tour.startDates.find(
    (dates) => dates.date.getTime() === disiredDate
  );
  if (!date) 
    throw new AppError('Invalid tour date!', 400);
  if (date.participants + 1 > tour.maxGroupSize)
    throw new AppError('All available spots are taken for this date!', 400);
  date.participants++;
  await tour.save();
};

const getCheckoutSession = catchAsync(async (req, res) => {
  const { tourId, startDate } = req.params;
  const userId = req.user._id;
  const disiredDate = parseInt(startDate);
  const tour = await Tour.findById(tourId);
  await checkDisiredDate(tour, disiredDate);
  const alreadyBooked = await Booking.findOne({ 
    tour: tourId, 
    user: userId  
  });
  if (alreadyBooked) 
    throw new AppError('You have already booked this tour!', 400);
  const booking = await Booking.create({ 
    tour: tourId, 
    user: userId, 
    price: tour.price,
    date: new Date(disiredDate).toISOString(),
  });
  const domain = `${req.protocol}://${req.get('host')}/api/v1/bookings`;
  const [success, cancel] = await booking.generatePaidTokens();
  const { _id: id } = booking;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${domain}/webhook-checkout/${id}/${success}`,
    cancel_url: `${domain}/webhook-checkout/${id}/${cancel}`,
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
    sessionId: session.id,
  });
});

const BOOKING_ERROR = new AppError('Invalid booking!', 400);

const freeTourSpot = async (booking) => {
  const tour = await Tour.findById(booking.tour);
  tour.startDates[booking.date]--;
  await tour.save();
};

const createBookingCheckout = catchAsync(async (req, res) => {
  const { id, paidToken } = req.params;
  const booking = await Booking
    .findById(id)
    .select('+successPaidToken +cancelPaidToken');
  if (!booking) throw BOOKING_ERROR
  const encrypted = crypto
    .createHash('sha256')
    .update(paidToken)
    .digest('hex');
  const success = booking.successPaidToken === encrypted;
  const cancel = booking.cancelPaidToken === encrypted;
  if (!success && !cancel) throw BOOKING_ERROR;
  if (success) booking.paid = true;
  else freeTourSpot(booking);
  booking.successPaidToken = undefined;
  booking.cancelPaidToken = undefined;
  await booking.save({ validateBeforeSave: false });
  res.redirect(`/bookings?alert=${success ? 'success' : 'cancel'}-booking`);
});

const getAccountBookings = catchAsync(async (req, res) => {
  const { user } = req;
  const bookings = await Booking.find({ user: user._id, paid: true });
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
  getAccountBookings,
};
