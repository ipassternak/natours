'use strict';

const path = require('node:path');
const sharp = require('sharp');
const User = require('../models/userModel');
const ControllerFactory = require('./controllerFactory');
const upload = require('../utils/uploadImages');
const catchAsync = require('../utils/catchAsync');

const USER_PHOTO_DIR = path.join(process.cwd(), 'public', 'img', 'users');

const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = catchAsync(async (req, res, next) => {
  const { file } = req;
  if (!file) return next();
  const filename = `user-${req.user._id}-${Date.now()}.jpeg`;
  req.file.filename = filename;
  await sharp(file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`${USER_PHOTO_DIR}/${filename}`);
  next();
});

const getAccountId = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

const userController = new ControllerFactory(User);

const getAllUsers = userController.getAll();
const getUser = userController.getOne();
const updateUser = userController.updateOne();
const deleteUser = userController.deleteOne();

const updateAccount = catchAsync(async (req, res) => {
  const { user, body } = req;
  const filteredBody = user.filterUpdateBody(body);
  const { file: photo } = req;
  if (photo) filteredBody.photo = photo.filename;
  const updated = await User.findByIdAndUpdate(user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updated,
    },
  });
});

const deleteAccount = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { disabledAt: Date.now() });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  uploadUserPhoto,
  resizeUserPhoto,
  getAccountId,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateAccount,
  deleteAccount,
};
