import { displayAlert } from './alerts.js';

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await fetch('/api/v1/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, passwordConfirm }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message);
    displayAlert('success', body.message);
    window.setTimeout(() => {
      location.assign('/');
    }, 1000);
  } catch (err) {
    displayAlert('error', `Failed to sign up. ${err.message}`);
  }
}

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
    }, 1000);
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

export const forgotPassword = async (email) => {
  try {
    const res = await fetch('/api/v1/users/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message);
    displayAlert('success', body.message);
  } catch (err) {
    displayAlert('error', `${err.message}`);
  }
};

export const resetPassword = async (resetToken, password, passwordConfirm) => {
  try {
    const res = await fetch(`/api/v1/users/reset-password/${resetToken}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password, passwordConfirm }),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.message);
    }
    displayAlert('success', 'You restored your password successfully!');
    window.setTimeout(() => {
      location.assign('/');
    }, 1000);
  } catch (err) {
    displayAlert('error', `${err.message}`);
  }
};
