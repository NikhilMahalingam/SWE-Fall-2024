import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = () => {
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
    const result = await stripe.confirmCardPayment( {
      payment_method: {
        card: card,
      },
    });

    if (result.error) {
      setPaymentMessage(`Payment failed: ${result.error.message}`);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
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