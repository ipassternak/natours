'use strict';

const path = require('node:path');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const ControllerFactory = require('./controllerFactory');
const upload = require('../utils/uploadImages');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { 
  MONTHS, 
  EARTH_RADIUS, 
  DISTANCE_TO_METERS 
} = require('../constants/dataConstants');

const TOUR_IMAGES_DIR = path.join(process.cwd(), 'public', 'img', 'tours');

const uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);

const resizeTourImages = catchAsync(async (req, res, next) => {
  const { files } = req;
  if (!files) return next();
  req.body.images = [];
  const filesPrefix = `tour-${req.params.id}-${Date.now()}`;
  const imagePromises = [...files.imageCover, ...files.images].map(
    (file, i) => {
      const processingCover = i === 0;
      const filename = `${filesPrefix}-${processingCover ? 'cover' : i}.jpeg`;
      if (processingCover) req.body.imageCover = filename;
      else req.body.images.push(filename);
      return sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`${TOUR_IMAGES_DIR}/${filename}`);
    }
  );
  await Promise.all(imagePromises);
  next();
});

const aliasHotTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const tourController = new ControllerFactory(Tour);

const getAllTours = tourController.getAll();
const getTour = tourController.getOne({ populate: 'reviews' });
const createTour = tourController.createOne();
const updateTour = tourController.updateOne();
const deleteTour = tourController.deleteOne();

const getToursStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: '$difficulty',
        results: { $sum: 1 },
        nRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { results: -1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

const getMonthlyPlan = catchAsync(async (req, res) => {
  const year = parseInt(req.params.year);
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        total: { $sum: 1 },
        tours: {
          $push: {
            name: '$name',
            rating: '$ratingsAverage',
            difficulty: '$difficulty',
            price: '$price',
          },
        },
      },
    },
    {
      $addFields: {
        month: { $arrayElemAt: [MONTHS, { $subtract: ['$_id', 1] }] },
        nMonth: '$_id',
      },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { total: -1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan,
    },
  });
});

const REQUEST_ERROR = new AppError(
  'Provide the coordinates of the current location in the format: lng,lat!',
  400
);

const toursWithin = catchAsync(async (req, res) => {
  const { distance, coords, unit } = req.params;
  const [lng, lat] = coords.split(',').map(parseFloat);
  if (!lat || !lng) throw REQUEST_ERROR;
  const radius = parseFloat(distance) / EARTH_RADIUS[unit] || 'km';
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

const getDistances = catchAsync(async (req, res) => {
  const { coords, unit } = req.params;
  const [lng, lat] = coords.split(',').map(parseFloat);
  if (!lat || !lng) throw REQUEST_ERROR;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        distanceField: 'distance',
        distanceMultiplier: 1 / DISTANCE_TO_METERS[unit] || 'km',
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      distances,
    },
  });
});

module.exports = {
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
};
