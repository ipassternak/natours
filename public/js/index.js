import { signup, login, logout } from './auth.js';
import { updateProfile, changePassword } from './updateSettings.js';
import { bookTour } from './stripe.js';
import { displayAlert } from './alerts.js';
import { displayMap } from './map.js';

const signupForm = document.querySelector('.form--signup');
const loginForm = document.querySelector('.form--login');
const updateProfileForm = document.querySelector('.form-user-data');
const changePasswordForm = document.querySelector('.form-user-password');
const nameField = document.getElementById('name');
const emailField = document.getElementById('email');
const photoField = document.getElementById('photo');
const currenPasswordField = document.getElementById('password-current');
const passwordField = document.getElementById('password');
const passwordConfirmField = document.getElementById('password-confirm');
const bookBtn = document.getElementById('book-tour');

const sumbitBtn = document.querySelector('.btn.btn--green');
const logoutBtn = document.querySelector('.nav__el.nav__el--logout');
const changePasswordBtn = document.querySelector('.btn-change-password');
const alertMessage = document.querySelector('body').dataset.alert;
const map = document.getElementById('map');

const getValues = (fields) => fields.map((field) => field.value);
const removeValues = (fields) => fields.forEach((field) => field.value = '');

if (signupForm) {
  const fields = [nameField, emailField, passwordField, passwordConfirmField];
  signupForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    sumbitBtn.textContent = 'Submitting...';
    await signup(...getValues(fields));
    fields.forEach((field) => field.value = '');
    sumbitBtn.textContent = 'Sign up';
  });
}

if (loginForm) {
  const fields = [emailField, passwordField];
  loginForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    sumbitBtn.textContent = 'Submitting...';
    await login(...getValues(fields));
    removeValues(fields);
    sumbitBtn.textContent = 'Log in';
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (updateProfileForm) {
  updateProfileForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const form = new FormData();
    form.append('name', nameField.value);
    form.append('email', emailField.value);
    form.append('photo', photoField.files[0]);
    updateProfile(form);
  });
}

if (changePasswordForm) {
  const fields = [
    currenPasswordField,
    passwordField,
    passwordConfirmField,
  ];
  changePasswordForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    changePasswordBtn.textContent = 'Updating...';
    const currentPassword = currenPasswordField.value;
    const password = passwordField.value;
    const passwordConfirm = passwordConfirmField.value;
    await changePassword({ currentPassword, password, passwordConfirm });
    changePasswordBtn.textContent = 'Change password';
    removeValues(fields);
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', async (ev) => {
    ev.preventDefault();
    bookBtn.textContent = 'Processing...';
    const { tourId } = bookBtn.dataset;
    await bookTour(tourId);
    bookBtn.textContent = 'Book tour now!';
  });
}

if (alertMessage) displayAlert('success', alertMessage);

if (map) {
  const locations = JSON.parse(map.dataset.locations);
  displayMap(locations);
}
