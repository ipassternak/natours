import { displayAlert } from './alerts';

const stripe = Stripe('');

export const bookTour = async (bookedTour) => {
  try {
    const res = await fetch(`/api/v1/bookings/checkout-session/${bookedTour}`, {
      method: 'GET',
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message);
    await stripe.redirectToCheckout({
      sessionId: body.sessionId,
    });
  } catch (err) {
    displayAlert('error', err.message);
  }
};
