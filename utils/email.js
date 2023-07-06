'use strict';

const path = require('node:path');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
const nodemailer = require('nodemailer');
const {
  NODE_ENV,
  PASSWORD_EXPIRES_IN,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  EMAIL_FROM,
  SENDGRID_USERNAME,
  SENDGRID_PASSWORD,
} = process.env;

const transports = {
  development: nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD,
    },
  }),
  production: nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
      user: SENDGRID_USERNAME,
      pass: SENDGRID_PASSWORD,
    },
  }),
};

const createTemp = (template, subject) => {
  const temp = path.join(process.cwd(), 'views', 'email', `${template}.pug`);
  return async (user, url) => {
    const html = pug.renderFile(temp, {
      firstName: user.name.split(' ')[0],
      subject,
      url,
    });
    const mailOptions = {
      from: `Natours <${EMAIL_FROM}>`,
      to: user.email,
      subject,
      html,
      text: htmlToText(html),
    };
    await transports[NODE_ENV].sendMail(mailOptions);
  };
};

const emailTemplates = {
  sendWelcome: createTemp('welcome', 'Welcome to the Natours!'),
  sendResetPassword: createTemp(
    'passwordReset',
    `Your password reset token (valid for only ${PASSWORD_EXPIRES_IN} minutes)`
  ),
};

module.exports = emailTemplates;
