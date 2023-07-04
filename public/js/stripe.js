import axios from 'axios';
import { displayAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51NPnPRGUzfLf8x9WCicqji93UXZkxvn4FCJvq2z23y43MsV5kaH1vIzF8qebLOh6Q1Zmj850AFW0n4ByONewy96R00CFfOp14h'
);

export const bookTour = async (tourId) => {
  try {
    const { data } = await axios({
      method: 'GET',
      url: `http://127.0.0.1:8000/api/v1/bookings/checkoutSession/${tourId}`,
    });
    await stripe.redirectToCheckout({
      sessionId: data.session.id,
    });
  } catch (err) {
    displayAlert('error', err.message);
  }
};
