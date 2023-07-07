import { displayAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51NPnPRGUzfLf8x9WCicqji93UXZkxvn4FCJvq2z23y43MsV5kaH1vIzF8qebLOh6Q1Zmj850AFW0n4ByONewy96R00CFfOp14h'
);

export const bookTour = async (bookedTour) => {
  try {
    const res = await fetch(`/api/v1/bookings/checkoutSession/${bookedTour}`, {
      method: 'GET',
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.message);
    }
    const { session } = await res.json();
    await stripe.redirectToCheckout({
      sessionId: session.id,
    });
  } catch (err) {
    displayAlert('error', err.message);
  }
};
