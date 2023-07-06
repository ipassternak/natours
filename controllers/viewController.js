'use strict';

const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const PAGE_ALERTS = require('../constants/appConstants');

const getAlert = (req, res, next) => {
  const { alert } = req.query;
  if (alert) res.locals.alert = PAGE_ALERTS[alert];
  next();
};

const getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', { 
    title: 'All Tours', 
    tours 
  });
});

const getTour = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    select: 'content rating user',
  });
  if (!tour) throw new AppError('Tour not found!', 404);
  res.status(200).render('tour', { 
    title: `${tour.name} Tour`, 
    tour 
  });
});

const getLoginForm = (req, res) => {
  res.status(200).render('login', { 
    title: 'Log into account' 
  });
};

const getAccount = (req, res) => {
  const { user } = req;
  res.status(200).render('account', {
    title: 'Your account',
    user,
  });
};

module.exports = {
  getAlert,
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
};
