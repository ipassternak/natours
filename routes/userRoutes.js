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
  restrictToRoles,
  forgotPassword,
  resetPassword,
  changePassword,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.use(protect);

router
  .route('/account')
  .get(getAccountId, getUser)
  .patch(uploadUserPhoto, resizeUserPhoto, updateAccount)
  .delete(deleteAccount);

router.patch('/account/change-password', changePassword);

router.use(restrictToRoles('admin'));

router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
