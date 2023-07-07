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
const bookBtns = document.querySelectorAll('.btn.btn--green.book-tour');

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
    const { textContent } = sumbitBtn;
    sumbitBtn.textContent = 'Submitting...';
    await signup(...getValues(fields));
    fields.forEach((field) => field.value = '');
    sumbitBtn.textContent = textContent;
  });
}

if (loginForm) {
  const fields = [emailField, passwordField];
  loginForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const { textContent } = sumbitBtn;
    sumbitBtn.textContent = 'Submitting...';
    await login(...getValues(fields));
    removeValues(fields);
    sumbitBtn.textContent = textContent;
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
    const { textContent } = changePasswordBtn;
    changePasswordBtn.textContent = 'Updating...';
    const currentPassword = currenPasswordField.value;
    const password = passwordField.value;
    const passwordConfirm = passwordConfirmField.value;
    await changePassword({ currentPassword, password, passwordConfirm });
    changePasswordBtn.textContent = textContent;
    removeValues(fields);
  });
}

if (bookBtns) {
  bookBtns.forEach((btn) => btn.addEventListener('click', async (ev) => {
    ev.preventDefault();
    const { textContent } = btn;
    btn.textContent = 'Processing...';
    const { bookedTour } = btn.dataset;
    await bookTour(bookedTour);
    btn.textContent = textContent;
  }));
}

if (alertMessage) displayAlert('success', alertMessage);

if (map) {
  const locations = JSON.parse(map.dataset.locations);
  displayMap(locations);
}
