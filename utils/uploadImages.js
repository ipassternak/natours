'use strict';

const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) cb(null, true);
    else cb(new AppError('The uploaded file is not an image!', 400), false);
  },
});

module.exports = upload;
