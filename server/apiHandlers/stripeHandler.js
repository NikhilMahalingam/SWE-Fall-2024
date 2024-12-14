import 'dotenv/config';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(amount) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, 
      currency: 'usd',
      payment_method_types: ['card'],
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating Payment Intent:', error.message, error.stack);
    throw error;
  }
}


export default { createPaymentIntent }; 
