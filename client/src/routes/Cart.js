import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm.js';

const stripePromise = loadStripe("pk_test_51QOp2lDkIHmUkoEWbRxZrQrnRrdDlmUgNUt5LcZwqLXXnphXDLgE4xEFFWMheq8Mej7I862M9vUGU4cvzke43Ako00SvDsCa1t");


function Cart({ user, cart, onCartChange, setCart }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  // 1. Calculate total cart price
  const totalPrice = cart.reduce((sum, part) => sum + (part.unit_price || 0), 0);
  const totalPriceInCents = Math.round(totalPrice * 100);

  // 2. When user clicks Checkout, call your server endpoint for a PaymentIntent
  const handleCheckoutClick = async () => {
    try {
      const response = await fetch('http://localhost:8000/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPriceInCents })  
      });

      const data = await response.json();
      if (data.clientSecret) {
        // 3. Store the clientSecret in React state
        setClientSecret(data.clientSecret);
        setShowCheckout(true); // Show the checkout form
      } else {
        console.error('No clientSecret returned from server:', data);
      }
    } catch (error) {
      console.error('Error creating PaymentIntent:', error);
    }
  };


  const handleRemoveClick = async (part_id) => {
    if (!user) {
      console.error("User not logged in");
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/cart/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, part_id: part_id }),
      });

      const data = await response.json();
      if (data.success) {
        // Re-fetch the cart or manually remove from local cart state:
        fetch(`http://localhost:8000/cart?user_id=${user.user_id}`)
          .then((res) => res.json())
          .then((updatedCart) => setCart(updatedCart))
          .catch(console.error);
      } else {
        console.error('Remove failed:', data.error);
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>

      <h1>Your Cart</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {cart.map((part, idx) => (
          <li key={idx} style={{ marginBottom: '0.5rem' }}>
            {part.part_name} - ${part.unit_price} (Qty: {part.quantity})
            <button
              style={{ marginLeft: '1rem' }}
              onClick={() => handleRemoveClick(part.part_id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>


      <p>Total: ${totalPrice.toFixed(2)}</p>
      
      <button onClick={handleCheckoutClick}>Checkout</button>

      {showCheckout && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}

export default Cart;

