import { displayAlert } from './alerts.js';

export const login = async (email, password) => {
  try {
    const res = await fetch('/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.message);
    }
    displayAlert('success', 'You are logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
    }, 750);
  } catch (err) {
    displayAlert('error', `Failed to log in. ${err.message}`);
  }
};

export const logout = async () => {
  try {
    const res = await fetch('/api/v1/users/logout', {
      method: 'GET',
    });
    if (!res.ok) throw new Error();
    if (location.pathname === '/account') location.assign('/');
    else location.reload(true);
  } catch (err) {
    displayAlert('error', 'Failed logging out. Try again!');
  }
};
