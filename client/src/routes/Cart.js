/*import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm.js';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_51QOp2lDkIHmUkoEWbRxZrQrnRrdDlmUgNUt5LcZwqLXXnphXDLgE4xEFFWMheq8Mej7I862M9vUGU4cvzke43Ako00SvDsCa1t');

export default function Cart() {
  const options = {
    // passing the client secret obtained from the server
    clientSecret: '{{CLIENT_SECRET}}',
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
};

*/

import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm.js';

const stripePromise = loadStripe("pk_test_51QOp2lDkIHmUkoEWbRxZrQrnRrdDlmUgNUt5LcZwqLXXnphXDLgE4xEFFWMheq8Mej7I862M9vUGU4cvzke43Ako00SvDsCa1t");

function Cart({ cart, onCartChange }) {
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckoutClick = () => {
    setShowCheckout(true);
  };


  const totalPrice = cart.reduce((sum, part) => {
    return sum + (part.unit_price || 0);
  }, 0);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Your Cart</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {cart.map((part, idx) => (
          <li key={idx} style={{ marginBottom: '0.5rem' }}>
            {part.part_name} - ${part.unit_price}
          </li>
        ))}
      </ul>

      <p style={{ fontWeight: 'bold', marginTop: '1rem' }}>
        Total: ${totalPrice.toFixed(2)}
      </p>

      <button onClick={handleCheckoutClick}>Checkout</button>
      {showCheckout && stripePromise && (
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}

export default Cart;

