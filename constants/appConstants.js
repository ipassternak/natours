'use strict';

const HPP_WHITELIST = [
  'duration',
  'maxGroupSize',
  'ratingsAverage',
  'ratingsQuantity',
  'difficulty',
  'price',
];

const QUERY_EXCLUDED_FIELDS = ['page', 'sort', 'limit', 'fields'];

const ALLOWED_QUERY_OPERATORS = ['gte', 'gt', 'lte', 'lt', 'eq', 'ne'];

const PAGE_ALERTS = {
  booking: 'Your booking was successful!',
  completeRegistation: 'Your account confirmed. Log in to start your new journey!',
};

module.exports = { 
  HPP_WHITELIST, 
  QUERY_EXCLUDED_FIELDS, 
  ALLOWED_QUERY_OPERATORS,
  PAGE_ALERTS
};
