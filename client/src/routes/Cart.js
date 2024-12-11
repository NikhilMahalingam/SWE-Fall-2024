import React, { useState } from 'react';
import '../assets/css/Cart.css';

function Cart() {
  
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckoutClick = () => {
    setShowCheckout(true); // Show the checkout form
  };

  
  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      <p>Your cart is currently empty. Add some items to see them here!</p>

      <button onClick={handleCheckoutClick}>Checkout</button>


    </div>
  );
}

export default Cart;
