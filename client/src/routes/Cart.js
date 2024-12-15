import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm.js';

const stripePromise = loadStripe("pk_test_51QOp2lDkIHmUkoEWbRxZrQrnRrdDlmUgNUt5LcZwqLXXnphXDLgE4xEFFWMheq8Mej7I862M9vUGU4cvzke43Ako00SvDsCa1t");


function Cart({ user, cart, onCartChange }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  console.log("User object in Cart:", user);
  console.log(cart);
  const totalPrice = cart.parts.reduce((sum, part) => {
    return sum + (part.unit_price * part.quantity);
  }, 0);
  const totalPriceInCents = Math.round(totalPrice * 100);


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
    console.log("removing item:")
    fetch('http://localhost:8000/cart/remove', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.user_id, part_id })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        fetch(`http://localhost:8000/cart?user_id=${user.user_id}`)
          .then(r => r.json())
          .then(newCart => onCartChange(newCart))
          .catch(console.error);
      } else {
        console.error("Failed to decrement:", data.error);
      }
    })
    .catch(err => console.error("Error decrementing:", err));
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>

      <h1>Your Cart</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {cart.parts.map((part, idx) => (
          <li key={idx} style={{ marginBottom: '0.5rem' }}>
            {part.part_name} - ${part.unit_price} (Qty: {part.quantity})
            <button
              style={{ marginLeft: '1rem' }}
              onClick={() => {
                console.log("Part id to be removed:", part.part_id);
                handleRemoveClick(part.part_id)
              }}
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
          <CheckoutForm clientSecret={clientSecret} user={user} cart={cart} /> 
        </Elements>
)}
    </div>
  );
}

export default Cart;

