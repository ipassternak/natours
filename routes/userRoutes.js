'use strict';

const express = require('express');
const {
  uploadUserPhoto,
  resizeUserPhoto,
  getAccountId,
  getAllUsers,
  updateAccount,
  deleteAccount,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const {
  signup,
  login,
  logout,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  changePassword,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(protect);

router
  .route('/account')
  .get(getAccountId, getUser)
  .patch(uploadUserPhoto, resizeUserPhoto, updateAccount)
  .delete(deleteAccount);

router.patch('/account/changePassword', changePassword);

router.use(restrictTo('admin'));

router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
