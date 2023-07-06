'use strict';

const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { xss } = require('express-xss-sanitizer');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const { HPP_WHITELIST } = require('./constants/appConstants');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const errorController = require('./controllers/errorController');

const CWD = process.cwd();

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(CWD, 'views'));
app.use(express.static(path.join(CWD, 'public')));

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'The request limit from the current IP address has been reached!',
});

app.use(cors());

app.options('*', cors());

app.use(limiter);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        scriptSrc: [`'self'`, `'unsafe-eval'`, 'js.stripe.com'],
        frameSrc: [`'self'`, 'js.stripe.com'],
        connectSrc: [`'self'`, 'http://127.0.0.1:8000'],
        imgSrc: [
          `'self'`,
          'https://a.basemaps.cartocdn.com',
          'https://b.basemaps.cartocdn.com',
          'https://c.basemaps.cartocdn.com',
          'data:',
        ],
      },
    },
  })
);
app.use(express.json({ limit: '5kb' }));
app.use(express.urlencoded({ extended: true, limit: '5kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp(HPP_WHITELIST));
app.use(xss());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  const route = req.originalUrl;
  next(new AppError(`Invalid route: ${route}!`, 404));
});

app.use(errorController);

module.exports = app;
