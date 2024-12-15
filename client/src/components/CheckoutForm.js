import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ clientSecret, user, cart, onCartChange }) => {  // Accept clientSecret as a prop
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setPaymentMessage('Stripe has not loaded yet.');
      return;
    }

    setIsProcessing(true);
    const card = elements.getElement(CardElement);

    // Pass the clientSecret to confirmCardPayment
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
      },
    });

    if (result.error) {
      setPaymentMessage(`Payment failed: ${result.error.message}`);
    } else if (result.paymentIntent.status === 'succeeded') {
      console.log(cart);
      console.log({ user_id: user.user_id, order_id: cart.order_id });
      const response = await fetch('http://localhost:8000/complete-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, order_id: cart.order_id })  
      });
      if (response.status === 200) {
        setPaymentMessage('Payment successful!');
      }
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe || isProcessing}>
        {isProcessing ? "Processing..." : "Pay"}
      </button>
      {paymentMessage && <p>{paymentMessage}</p>}
    </form>
  );
};

export default CheckoutForm;
