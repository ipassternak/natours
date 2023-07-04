import axios from 'axios';
import { displayAlert } from './alerts.js';

export const login = async (email, password) => {
  try {
    await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/login',
      data: { email, password },
    });
    displayAlert('success', 'Logged in successfully!');
    window.setTimeout(() => {
      location.assign('/');
    }, 750);
  } catch (err) {
    displayAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    await axios({
      method: 'GET',
      url: 'http://127.0.0.1:8000/api/v1/users/logout',
    });
    if (location.pathname === '/account') location.assign('/');
    else location.reload(true);
  } catch (err) {
    displayAlert('error', 'Error logging out! Try again');
  }
};
