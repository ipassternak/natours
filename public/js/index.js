import { login, logout } from './login.js';
import { updateProfile, changePassword } from './updateSettings.js';
import { bookTour } from './stripe.js';
import { displayMap } from './map.js';

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

const logoutBtn = document.querySelector('.nav__el.nav__el--logout');
const changePasswordBtn = document.querySelector('.btn-change-password');
const map = document.getElementById('map');

if (loginForm) {
  loginForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const email = emailField.value;
    const password = passwordField.value;
    login(email, password);
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
  const passwordFields = [
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
    passwordFields.forEach((field) => (field.value = ''));
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

if (map) {
  const locations = JSON.parse(map.dataset.locations);
  displayMap(locations);
}
