import axios from 'axios';
import { displayAlert } from './alerts.js';

export const login = async (email, password) => {
  try {
    await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: { email, password },
    });
    displayAlert('success', 'You are logged in successfully!');
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
      url: '/api/v1/users/logout',
    });
    if (location.pathname === '/account') location.assign('/');
    else location.reload(true);
  } catch (err) {
    displayAlert('error', 'Failed logging out. Try again!');
  }
};
