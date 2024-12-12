import {Elements} from '@stripe/react-stripe-js';
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



/*import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm.js';

const stripePromise = loadStripe("pk_test_51QOp2lDkIHmUkoEWbRxZrQrnRrdDlmUgNUt5LcZwqLXXnphXDLgE4xEFFWMheq8Mej7I862M9vUGU4cvzke43Ako00SvDsCa1t");

function Cart() {
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckoutClick = () => {
    setShowCheckout(true);
  };

  return (
    <div>
      <h1>Your Cart</h1>
      <button onClick={handleCheckoutClick}>Checkout</button>

      {showCheckout && (
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}

export default Cart;
*/
