import { displayAlert } from './alerts.js';

const updateSettings = async (url, successMsg, data) => {
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      body: data,
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.message);
    }
    displayAlert('success', successMsg);
  } catch (err) {
    displayAlert('error', err.message);
  }
};

export const updateProfile = updateSettings.bind(
  null,
  '/api/v1/users/account',
  'Profile was updated successfully!'
);
export const changePassword = updateSettings.bind(
  null,
  '/api/v1/users/account/change-password',
  'Password was changed successfully!'
);
