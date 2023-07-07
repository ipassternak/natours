import { displayAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51NPnPRGUzfLf8x9WCicqji93UXZkxvn4FCJvq2z23y43MsV5kaH1vIzF8qebLOh6Q1Zmj850AFW0n4ByONewy96R00CFfOp14h'
);

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
