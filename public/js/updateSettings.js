import axios from 'axios';
import { displayAlert } from './alerts.js';

const updateSettings = async (url, successMsg, data) => {
  try {
    await axios({
      method: 'PATCH',
      url,
      data,
    });
    displayAlert('success', successMsg);
  } catch (err) {
    displayAlert('error', err.response.data.message);
  }
};

export const updateProfile = updateSettings.bind(
  null,
  'http://127.0.0.1:8000/api/v1/users/account',
  'Profile was updated successfully'
);
export const changePassword = updateSettings.bind(
  null,
  'http://127.0.0.1:8000/api/v1/users/account/changePassword',
  'Password was changed successfully!'
);
