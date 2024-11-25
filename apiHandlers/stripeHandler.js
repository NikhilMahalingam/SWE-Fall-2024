require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(amount) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency: 'usd',
      payment_method_types: ['card'],
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating Payment Intent:', error.message, error.stack);
    throw error;
  }
}

module.exports = {
  createPaymentIntent,
};